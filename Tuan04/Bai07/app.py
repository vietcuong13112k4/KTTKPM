import os

env = os.environ.get('APP_ENV', 'Chưa được thiết lập')
print(f"Môi trường hiện tại là: {env}")