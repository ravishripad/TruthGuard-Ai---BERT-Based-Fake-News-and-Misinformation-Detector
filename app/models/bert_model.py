import torch
import torch.nn as nn
from transformers import BertTokenizer, BertModel
from pathlib import Path
from functools import lru_cache

class EnhancedBertForSequenceClassification(nn.Module):
    def __init__(self, model_name='bert-base-uncased', num_classes=2, dropout=0.3):
        super().__init__()
        self.num_classes = num_classes
        self.bert = BertModel.from_pretrained(model_name)
        self.dropout = nn.Dropout(dropout)

        # Additional layers for better performance
        self.lstm = nn.LSTM(
            input_size=self.bert.config.hidden_size,
            hidden_size=256,
            num_layers=2,
            batch_first=True,
            dropout=0.2,
            bidirectional=True
        )

        # Attention mechanism
        self.attention = nn.MultiheadAttention(
            embed_dim=512,  # bidirectional LSTM output
            num_heads=8,
            dropout=0.1
        )

        # Classification layers
        self.classifier = nn.Sequential(
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(128, num_classes)
        )

        # Layer normalization
        self.layer_norm = nn.LayerNorm(512)

    def forward(self, input_ids, attention_mask):
        # BERT encoding
        bert_output = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask
        )

        # Get sequence output (all tokens)
        sequence_output = bert_output.last_hidden_state
        sequence_output = self.dropout(sequence_output)

        # LSTM layer
        lstm_output, _ = self.lstm(sequence_output)
        lstm_output = self.layer_norm(lstm_output)

        # Self-attention
        lstm_output_transposed = lstm_output.transpose(0, 1)
        attn_output, _ = self.attention(
            lstm_output_transposed,
            lstm_output_transposed,
            lstm_output_transposed
        )
        attn_output = attn_output.transpose(0, 1)

        # Global max pooling
        pooled_output = torch.max(attn_output, dim=1)[0]

        # Classification
        logits = self.classifier(pooled_output)

        return logits

@lru_cache(maxsize=1)
def get_model():
    """
    Load the fine-tuned BERT model and tokenizer.
    Uses caching to load only once.
    
    Returns:
        tuple: (model, tokenizer, checkpoint_info)
    """
    model_path = Path(__file__).parent.parent.parent / "enhanced_bert_welfake_model"
    
    # Load tokenizer
    tokenizer = BertTokenizer.from_pretrained(str(model_path))
    
    # Load checkpoint
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    checkpoint = torch.load(
        model_path / "model.pth",
        map_location=device
    )
    
    # Get model configuration from checkpoint
    num_classes = checkpoint.get('num_classes', 2)
    classification_type = checkpoint.get('classification_type', 'binary')
    model_config = checkpoint.get('config', {})
    dropout = model_config.get('dropout', 0.3)
    model_name = model_config.get('model_name', 'bert-base-uncased')
    
    # Create model with correct architecture
    model = EnhancedBertForSequenceClassification(
        model_name=model_name,
        num_classes=num_classes,
        dropout=dropout
    )
    
    # Load state dict
    model.load_state_dict(checkpoint['model_state_dict'])
    model.to(device)
    model.eval()
    
    return model, tokenizer, checkpoint

def predict_fake_news(text: str, model=None, tokenizer=None, checkpoint=None):
    """
    Predict whether a news article is fake or real.
    
    Args:
        text: News article text (can be title only, or title [SEP] text format)
        model: Pre-loaded model (optional)
        tokenizer: Pre-loaded tokenizer (optional)
        checkpoint: Model checkpoint with metadata (optional)
        
    Returns:
        dict: Prediction results with label, confidence, and probabilities
    """
    if model is None or tokenizer is None:
        model, tokenizer, checkpoint = get_model()
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # Format input to match training format: title [SEP] text
    # If input doesn't have [SEP], treat the whole input as title + duplicate as text
    if '[SEP]' not in text:
        # User passed only headline/claim - format it like training data
        # Use the text as both title and content for better model understanding
        formatted_text = f"{text} [SEP] {text}"
    else:
        formatted_text = text
    
    # Determine classification type from checkpoint
    num_classes = checkpoint.get('num_classes', 2) if checkpoint else 2
    classification_type = checkpoint.get('classification_type', 'binary') if checkpoint else 'binary'
    
    # Label mapping based on classification type
    # NOTE: WELFake dataset uses:
    # 0 = real (legitimate news)
    # 1 = fake (fake/misleading news)
    if classification_type == 'binary' and num_classes == 2:
        labels = {
            0: "real",
            1: "fake"
        }
    elif num_classes == 6:
        labels = {
            0: "pants-fire",
            1: "false",
            2: "barely-true",
            3: "half-true",
            4: "mostly-true",
            5: "true"
        }
    else:
        labels = {i: f"class_{i}" for i in range(num_classes)}
    
    # Tokenize input (use formatted text)
    encoding = tokenizer(
        formatted_text,
        add_special_tokens=True,
        max_length=512,
        padding='max_length',
        truncation=True,
        return_tensors='pt'
    )
    
    input_ids = encoding['input_ids'].to(device)
    attention_mask = encoding['attention_mask'].to(device)
    
    # Make prediction
    with torch.no_grad():
        logits = model(input_ids, attention_mask)
        probabilities = torch.softmax(logits, dim=1)
        predicted_class = torch.argmax(probabilities, dim=1).item()
        confidence = probabilities[0][predicted_class].item()
    
    # Convert probabilities to dict
    prob_dict = {labels[i]: float(probabilities[0][i].item()) for i in range(num_classes)}
    
    # Determine if fake based on classification type
    if classification_type == 'binary':
        is_fake = predicted_class == 1  # class 1 is "fake" in WELFake dataset
    else:
        is_fake = predicted_class < 3  # pants-fire, false, barely-true are considered fake
    
    return {
        "text": text,  # Return original text, not formatted
        "prediction": labels[predicted_class],
        "confidence": float(confidence),
        "probabilities": prob_dict,
        "is_fake": is_fake,
        "classification_type": classification_type
    }
