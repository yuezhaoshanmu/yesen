"""Optional offline asset preparation: pip install 'rembg[cpu]'.

Only the segmentation mask is used. The source photograph is never overwritten
and no face, clothing, or body pixels are generated. Review edges before shipping.
"""
from pathlib import Path

import numpy as np
from PIL import Image
from rembg import new_session, remove

root = Path(__file__).resolve().parents[1]
original = Image.open(root / '1.png').convert('RGBA')
if original.getchannel('A').getextrema()[0] < 255:
    result = original
else:
    mask = remove(original, session=new_session('isnet-general-use'), only_mask=True)
    alpha = np.array(mask)
    # Normalize the model's near-opaque foreground without changing its RGB.
    alpha[alpha >= 254] = 255
    pixels = np.array(original)
    pixels[:, :, 3] = alpha
    pixels[alpha == 0, :3] = 0  # Compress invisible pixels without altering edges.
    result = Image.fromarray(pixels)

destination = root / 'public' / 'images' / '1.png'
destination.parent.mkdir(parents=True, exist_ok=True)
result.save(destination, optimize=True)
print(f'Saved {destination}: {result.size}, {destination.stat().st_size:,} bytes')
