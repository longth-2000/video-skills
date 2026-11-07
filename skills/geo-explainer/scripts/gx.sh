#!/bin/zsh
# geo-explainer command line. Usage:
#   gx.sh new <dir> "<Title>" <slug> "<Province>" "<Focus>"   copy the template into <dir> (a new piece)
#   gx.sh geo <dir> [--no-osm]                                 map data from geo.json -> src/geodata.js, src/geodata2.js
#   gx.sh voice <dir> [--scratch]                              voice/script.json + takes -> voice/voice.wav, voice.json
#   gx.sh build <dir>                                          assemble index.html (syntax check included)
#   gx.sh still <dir> <t1,t2,...> <out.png> [scale]            one strip of frames at those seconds (default scale 0.3)
#   gx.sh check <dir>                                          text check: overlaps, cut-offs, safe zones (every 6th frame)
#   gx.sh audit <dir>                                          text audit: fonts, glyphs, Unicode, number format → text_audit.txt
#   gx.sh export <dir>                                         full render in 250-frame chunks + audio + share.mp4
#   gx.sh sheet <video.mp4> <out.jpg> [fps]                    contact sheet of a rendered video (default 1 frame/s)
#   gx.sh publish <dir>                                        copy renders/share.mp4 to config renders_out/<slug>.mp4
#   gx.sh archive <dir>                                        move the whole piece folder to config pieces_out/<slug> (verify, then delete local)
#   gx.sh config [key]                                         print ~/.config/geo-explainer/config.json (or one path)
set -e
set -o pipefail
HERE=${0:A:h}; SKILL=${HERE:h}; ENG=$SKILL/engine; T=$ENG/tools
cmd=$1; shift || true
CFG=$HOME/.config/geo-explainer/config.json
cfg() { [[ -f $CFG ]] && python3 -I -c "import json,os,sys;v=json.load(open(sys.argv[1])).get(sys.argv[2]);print(os.path.expanduser(v) if v else '')" $CFG $1; }
case $cmd in
  -h|--help|help|'') sed -n 2,11p $0; exit 0;;
  new)
    D=${1:?dir}; TITLE=${2:?title}; SLUG=${3:?slug}; PROV=${4:?province}; FOC=${5:?focus}
    [[ -e $D ]] && { echo "gx: $D exists — not overwriting"; exit 1; }
    mkdir -p ${D:h}; cp -R $SKILL/templates/piece $D
    UP=$(python3 -I -c "import sys;print(sys.argv[1].upper())" "$FOC")
    for f in $D/piece.json $D/geo.json $D/brief.md $D/LOG.md $D/src/head.html $D/src/scenes.js $D/src/shots.js; do
      python3 -I - "$f" "$TITLE" "$SLUG" "$PROV" "$FOC" "$UP" <<'PY'
import sys
f,t,s,p,fo,up=sys.argv[1:]
x=open(f).read().replace('__TITLE__',t).replace('__SLUG__',s).replace('__PROVINCE__',p).replace('__FOCUS_UPPER__',up).replace('__FOCUS__',fo)
open(f,'w').write(x)
PY
    done
    echo "gx: new piece in $D — next: edit geo.json, then gx.sh geo $D";;
  geo) node $HERE/geodata.mjs "$@";;
  voice) node $T/voice.mjs "$@";;
  build) node $T/build.mjs ${1:?dir} | tail -1;;
  still) node $T/still.mjs ${1:?dir} ${2:?times} ${3:?out} --scale ${4:-0.3};;
  check) node $T/textcheck.mjs ${1:?dir} --every 6 2>&1 | tail -15;;
  audit) node $T/text_audit.mjs ${1:?dir} --every 3;;
  export)
    D=${1:A}; [[ -f $D/index.html ]] || node $T/build.mjs $D >/dev/null
    node $T/text_audit.mjs $D --every 3 || { echo "gx: text audit found errors — fix them (see $D/text_audit.txt) before exporting"; exit 1; }
    N=$(python3 -I -c "import json,math;d=json.load(open('$D/voice.json'))['duration'];print(round(math.ceil(d*2)/2*24))")
    SEG=$D/renders/seg; mkdir -p $SEG; rm -f $D/renders/final.mp4; T_START=$SECONDS; DONE0=-1
    for ((a=0; a<N; a+=250)); do
      b=$((a+249)); (( b >= N )) && b=$((N-1)); out=$SEG/s$(printf %05d $a).mp4
      [[ -f $out ]] && continue
      rm -rf $D/frames; node $T/export.mjs $D --from $a --to $b --no-audio | tail -1
      ffmpeg -y -hide_banner -loglevel error -framerate 24 -start_number $a -i $D/frames/f%04d.png -frames:v $((b-a+1)) -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -r 24 $out
      rm -rf $D/frames; echo "chunk $a-$b / $N"
      (( DONE0 < 0 )) && DONE0=$a; el=$((SECONDS - T_START)); dn=$((b + 1 - DONE0)); left=$(( (N - b - 1) * el / (dn > 0 ? dn : 1) / 60 + 1 ))
      echo "progress $((b + 1))/$N frames ($(( (b + 1) * 100 / N ))%), ~$left min left"
    done
    echo "progress audio: mixing voice + score"
    ls $SEG/s*.mp4 | sed "s|^|file '|; s|$|'|" > $SEG/list.txt
    ffmpeg -y -hide_banner -loglevel error -f concat -safe 0 -i $SEG/list.txt -c copy -movflags +faststart $D/renders/final.mp4
    rm -rf $SEG
    node $T/export.mjs $D --only-audio --share --no-captions | tail -3
    [[ -f $D/renders/share.mp4 ]] || { echo "gx: export failed (no share.mp4)"; exit 1; }
    echo "gx: $D/renders/final.mp4 + share.mp4 ($(ffprobe -v error -show_entries format=duration -of csv=p=0 $D/renders/share.mp4)s)";;
  config) if [[ -n $1 ]]; then cfg $1; else cat $CFG 2>/dev/null || echo "gx: no $CFG (see references/storage.md)"; fi;;
  publish) D=${1:A}; O=$(cfg renders_out); [[ -n $O ]] || { echo "gx: renders_out not set in $CFG"; exit 1; }
    mkdir -p "$O"; S=$(python3 -I -c "import json;print(json.load(open('$D/piece.json'))['name'])"); cp "$D/renders/share.mp4" "$O/$S.mp4"; echo "gx: $O/$S.mp4";;
  archive) D=${1:A}; O=$(cfg pieces_out); [[ -n $O ]] || { echo "gx: pieces_out not set in $CFG"; exit 1; }
    S=$(python3 -I -c "import json;print(json.load(open('$D/piece.json'))['name'])"); T="$O/$S"
    [[ -e "$T" ]] && { echo "gx: $T exists — rename or remove it first"; exit 1; }
    rm -rf $D/frames $D/renders/seg; mkdir -p "$T"; rsync -a "$D/" "$T/"
    diff -rq "$D" "$T" >/dev/null || { echo "gx: copy differs — local folder kept"; exit 1; }
    echo "gx: $(cd "$T" && find . -type f | wc -l | tr -d ' ') files verified in $T"; rm -rf "$D"; echo "gx: local $D deleted";;
  sheet) V=${1:?video}; O=${2:?out}; R=${3:-1}
    N=$(python3 -I -c "import math,sys;d=float(sys.argv[1]);print(max(1,math.ceil(d*float(sys.argv[2])/8)))" "$(ffprobe -v error -show_entries format=duration -of csv=p=0 $V)" $R)
    ffmpeg -y -hide_banner -loglevel error -i $V -vf "fps=$R,scale=180:-1,tile=8x$N" -frames:v 1 $O; echo "gx: $O";;
  *) sed -n 2,11p $0; exit 2;;
esac
