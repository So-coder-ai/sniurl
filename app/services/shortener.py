import secrets
import string

BASE62 = string.ascii_letters + string.digits


def generate_short_code(length: int = 7) -> str:
    return "".join(secrets.choice(BASE62) for _ in range(length))
