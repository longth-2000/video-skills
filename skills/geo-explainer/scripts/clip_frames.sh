#!/bin/zsh
# Turn a stretch of a video clip into image frames the engine can draw (24 fps, deterministic).
#   usage: zsh scripts/clip_frames.sh <clip.mp4> <key> <start s> <dur s> <out dir> [fx 0..1]
#   writes <out>/v_<key>_P_0001.jpg… (portrait 720×1280, crop centred at fx) and v_<key>_L_0001.jpg… (landscape 1280×720)
#   Put the frames you need into the piece's assets/ (symlinks are fine); draw them with vname()/vimg() (fx/fx-video.js).
set -e
[[ $1 == -h || $1 == --help || -z $1 ]] && { sed -n 2,5p $0; exit 0; }
IN=${1:?clip}; K=${2:?key}; SS=${3:?start}; D=${4:?dur}; O=${5:?out}; FX=${6:-0.5}
mkdir -p $O
WH=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=s=x:p=0 "$IN" | head -1); W=${WH%x*}; H=${WH#*x}
if (( W > H )); then
  PCROP="crop=ih*9/16:ih:(iw-ih*9/16)*$FX:0,scale=720:1280"; LCROP="scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720"
else
  PCROP="scale=720:1280:force_original_aspect_ratio=increase,crop=720:1280"; LCROP="crop=iw:iw*9/16:0:(ih-iw*9/16)/2,scale=1280:720"
fi
ffmpeg -nostdin -y -hide_banner -loglevel error -ss $SS -t $D -i "$IN" -vf "fps=24,$PCROP" -q:v 9 $O/v_${K}_P_%04d.jpg
ffmpeg -nostdin -y -hide_banner -loglevel error -ss $SS -t $D -i "$IN" -vf "fps=24,$LCROP" -q:v 9 $O/v_${K}_L_%04d.jpg
echo "clip_frames: $K $(ls $O/v_${K}_P_*.jpg | wc -l | tr -d ' ') frames ($(du -ch $O/v_${K}_*.jpg | tail -1 | cut -f1))"
