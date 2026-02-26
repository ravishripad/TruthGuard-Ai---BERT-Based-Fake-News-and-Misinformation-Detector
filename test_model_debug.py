import torch
from app.models.bert_model import get_model, EnhancedBertForSequenceClassification

# Test with clear examples
tests = [
    'Stock Market Hits Record High Amid Economic Recovery',
    'BREAKING: Aliens Land in Central Park, Government Cover-up Exposed',
    'Scientists Discover New Treatment for Cancer That Shows Promise in Clinical Trials'
]

model, tokenizer, checkpoint = get_model()
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

print('Checking raw model outputs:\n')
print(f'Classification type: {checkpoint.get("classification_type")}')
print(f'Num classes: {checkpoint.get("num_classes")}')
print()

for text in tests:
    encoding = tokenizer(
        text,
        add_special_tokens=True,
        max_length=512,
        padding='max_length',
        truncation=True,
        return_tensors='pt'
    )
    
    input_ids = encoding['input_ids'].to(device)
    attention_mask = encoding['attention_mask'].to(device)
    
    with torch.no_grad():
        logits = model(input_ids, attention_mask)
        probabilities = torch.softmax(logits, dim=1)
        predicted_class = torch.argmax(probabilities, dim=1).item()
    
    print(f'Text: {text[:50]}...')
    print(f'  Raw logits: {logits[0].tolist()}')
    print(f'  Probabilities: {probabilities[0].tolist()}')
    print(f'  Predicted class index: {predicted_class}')
    print()
