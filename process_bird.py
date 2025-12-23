
from rembg import remove
from PIL import Image
import io
import os

# Input path: Use the one in artifacts that the user essentially uploaded initially or the best version we have.
# The user uploaded: uploaded_image_1766523669269.jpg (Original with checkboard background in the image itself?)
# Wait, let's look at the artifact list.
# uploaded_image_0_1766525895314.jpg seems to be the one the user just uploaded showing the bird.
# actually, let's use the one in the brain directory that was the "fixed" one but failed transparency.
# C:\Users\mengu\.gemini\antigravity\brain\34f0706c-648f-4575-a4df-d2dfc59048a2\bird_fixed_transparent_1766524851501.png
# This one HAS checkerboard pixels. rembg is smart enough to remove them usually if they are background.

input_path = r"C:\Users\mengu\.gemini\antigravity\brain\34f0706c-648f-4575-a4df-d2dfc59048a2\bird_fixed_transparent_1766524851501.png"
output_path = r"c:\Users\mengu\OneDrive\Desktop\mengDev\bird_clean.png"

# Check if input exists
if not os.path.exists(input_path):
    print(f"Error: {input_path} not found")
    exit(1)

with open(input_path, 'rb') as i:
    input_data = i.read()
    output_data = remove(input_data)
    
    with open(output_path, 'wb') as o:
        o.write(output_data)

print("Success: Background removed and saved to " + output_path)
