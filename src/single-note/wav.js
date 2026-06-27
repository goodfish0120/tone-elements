(function(){
  "use strict";

  const api = window.SoundLab;

  api.audioBufferToWav = buffer => {
    const channels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const samples = buffer.length;
    const ab = new ArrayBuffer(44 + samples * channels * 2);
    const view = new DataView(ab);
    writeString(view,0,"RIFF");
    view.setUint32(4,36 + samples * channels * 2,true);
    writeString(view,8,"WAVE");
    writeString(view,12,"fmt ");
    view.setUint32(16,16,true);
    view.setUint16(20,1,true);
    view.setUint16(22,channels,true);
    view.setUint32(24,sampleRate,true);
    view.setUint32(28,sampleRate * channels * 2,true);
    view.setUint16(32,channels * 2,true);
    view.setUint16(34,16,true);
    writeString(view,36,"data");
    view.setUint32(40,samples * channels * 2,true);
    let offset = 44;
    for(let i=0;i<samples;i++) for(let ch=0;ch<channels;ch++){
      const v = api.clamp(buffer.getChannelData(ch)[i], -1, 1);
      view.setInt16(offset, v < 0 ? v * 0x8000 : v * 0x7fff, true);
      offset += 2;
    }
    return new Blob([view], {type:"audio/wav"});
  };

  function writeString(view, offset, text){
    for(let i=0;i<text.length;i++) view.setUint8(offset+i, text.charCodeAt(i));
  }
})();
