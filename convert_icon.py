from PIL import Image
import os

img = Image.open('assets/icon.jpg')
img.save('assets/icon.ico', format='ICO', sizes=[(256, 256), (128, 128), (64, 64), (48, 48), (32, 32), (16, 16)])
print("Converted assets/icon.jpg to assets/icon.ico")
