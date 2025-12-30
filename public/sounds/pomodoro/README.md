# Pomodoro Timer Sounds

This directory should contain the notification sounds for the Pomodoro timer.

## Required Files

Place the following audio files in this directory:

- `bell.wav` - Session start sound
- `chime.wav` - Break start sound
- `gong.wav` - Break end sound
- `ding.wav` - Session end sound
- `tick.wav` - Optional tick sound

## Sound Specifications

- **Format**: WAV (recommended), MP3, OGG, or M4A
- **Duration**: 1-2 seconds
- **Size**: Max 200KB per file (WAV) or 100KB (MP3/OGG)
- **Quality**: 16-bit 44.1kHz (WAV) or 128kbps (MP3)

## Where to Get Sounds

### Free Sound Resources

For any sound, read carefully the attribution instructions and use only sounds for which you have authorization. Add the author name, the name of the sound and the url of the sound in the Pomodoro-sounds-attribution.md file in the repository.

1. **Freesound.org** - https://freesound.org/

   - Search for: "bell", "chime", "gong", "ding"
   - Filter by: Short duration (< 2 seconds)
   - License: CC0 or CC-BY

2. **Zapsplat** - https://www.zapsplat.com/

   - Free sound effects
   - No attribution required for standard license

3. **Mixkit** - https://mixkit.co/free-sound-effects/
   - Free sound effects
   - Royalty-free

### Recommended Search Terms

- "notification bell"
- "chime short"
- "gong meditation"
- "ding notification"
- "timer tick"

### Format Conversion (Optional)

WAV files work great as-is! But if you need to convert:

**WAV to MP3** (to reduce size):

```bash
ffmpeg -i input.wav -b:a 128k -ar 44100 output.mp3
```

**Any format to WAV**:

```bash
ffmpeg -i input.ogg -ar 44100 -ac 2 output.wav
```

## Example Download & Rename Workflow

```bash
cd /home/lucy/DEV/ada-tools/public/sounds/pomodoro

# After downloading from Freesound.org, rename them:
mv ~/Downloads/123456__user__bell-sound.wav bell.wav
mv ~/Downloads/234567__user__chime-sound.wav chime.wav
mv ~/Downloads/345678__user__gong-sound.wav gong.wav
mv ~/Downloads/456789__user__ding-sound.wav ding.wav
mv ~/Downloads/567890__user__tick-sound.wav tick.wav

# Or if using wget (replace URLs):
wget -O bell.wav "YOUR_FREESOUND_DOWNLOAD_URL"
```

## Testing Sounds

After adding the files, you can test them in the browser console:

```javascript
const audio = new Audio("/sounds/pomodoro/bell.wav");
audio.play();
```

Or verify files exist:

```bash
ls -lh /home/lucy/DEV/ada-tools/public/sounds/pomodoro/
# Should show: bell.wav, chime.wav, gong.wav, ding.wav, tick.wav
```
