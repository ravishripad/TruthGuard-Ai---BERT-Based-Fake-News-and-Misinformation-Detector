from slowapi import Limiter
from slowapi.util import get_remote_address

# Shared rate limiter — uses client IP as the key.
# Import this instance in main.py and all route files.
limiter = Limiter(key_func=get_remote_address)
