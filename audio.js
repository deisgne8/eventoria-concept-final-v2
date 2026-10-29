(() => {
'use strict';
const button=document.querySelector('.sound-toggle'),audio=document.querySelector('#ambient-audio'),intro=document.querySelector('#hero-end');
let context,boomBuffer,musicGain,effectGain,enabled=false,busy=false,pulse=0,nextBurst=0,burstCount=0;
const effects=new Set();
let brushGain,brushFilter,trickleGain,trickleFilter,brushPan,lastPing=0;
function state(){button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',enabled?'Turn sound off':'Turn sound on');button.querySelector('.sound-label').textContent=enabled?'SOUND ON':'SOUND OFF';}
async function setup(){
 if(!context){context=new (window.AudioContext||window.webkitAudioContext)();musicGain=context.createGain();musicGain.gain.value=.45;effectGain=context.createGain();effectGain.gain.value=.65;context.createMediaElementSource(audio).connect(musicGain);musicGain.connect(context.destination);effectGain.connect(context.destination);}
 await context.resume();setupBrush();
 if(!boomBuffer){const response=await fetch('assets/audio/emotion-boom.mp3');if(!response.ok)throw new Error('Sound unavailable');boomBuffer=await context.decodeAudioData(await response.arrayBuffer());}
}
function setupBrush(){
 if(brushGain)return;
 const buffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate),samples=buffer.getChannelData(0);
 let pink=0;for(let i=0;i<samples.length;i++){pink=.96*pink+.04*(Math.random()*2-1);samples[i]=pink*5;}
 const noise=context.createBufferSource();noise.buffer=buffer;noise.loop=true;
 brushFilter=context.createBiquadFilter();brushFilter.type='bandpass';brushFilter.frequency.value=1400;brushFilter.Q.value=.7;
 trickleFilter=context.createBiquadFilter();trickleFilter.type='bandpass';trickleFilter.frequency.value=3500;trickleFilter.Q.value=8;
 brushGain=context.createGain();trickleGain=context.createGain();brushGain.gain.value=0;trickleGain.gain.value=0;
 brushPan=context.createStereoPanner();brushPan.connect(context.destination);
 noise.connect(brushFilter);brushFilter.connect(brushGain);brushGain.connect(brushPan);
 noise.connect(trickleFilter);trickleFilter.connect(trickleGain);trickleGain.connect(brushPan);noise.start();
}
function brush(amount,pan){
 if(!context||!brushGain)return;
 const intensity=enabled&&!audio.paused&&!document.hidden?Math.min(1,Math.max(0,amount)):0,now=context.currentTime;
 brushGain.gain.setTargetAtTime(intensity*.055,now,intensity>0?.045:.16);
 trickleGain.gain.setTargetAtTime(intensity*.075,now,.08);
 brushFilter.frequency.setTargetAtTime(900+intensity*2200,now,.06);
 trickleFilter.frequency.setTargetAtTime(2800+Math.sin(now*3)*500+intensity*1400,now,.08);
 brushPan.pan.setTargetAtTime(Math.max(-.8,Math.min(.8,pan)),now,.08);
 if(intensity>.12&&now-lastPing>.09+(1-intensity)*.12){
  lastPing=now;button.dataset.interactionPings=String(Number(button.dataset.interactionPings||0)+1);const tone=context.createOscillator(),gain=context.createGain();
  const pitch=1800+Math.random()*2500;tone.frequency.setValueAtTime(pitch,now);tone.frequency.exponentialRampToValueAtTime(pitch*.35,now+.035);
  gain.gain.setValueAtTime(.012+intensity*.024,now);gain.gain.exponentialRampToValueAtTime(.0001,now+.07);
  tone.connect(gain);gain.connect(brushPan);tone.start();tone.stop(now+.08);tone.onended=()=>{tone.disconnect();gain.disconnect();};
 }
 button.dataset.interactionLevel=intensity.toFixed(2);
}
function stopEffects(){for(const effect of effects){effect.stop();effect.disconnect();}effects.clear();if(brushGain){brushGain.gain.cancelScheduledValues(context.currentTime);brushGain.gain.value=0;trickleGain.gain.cancelScheduledValues(context.currentTime);trickleGain.gain.value=0;}pulse=0;nextBurst=0;}
button.addEventListener('click',async()=>{if(busy)return;busy=true;try{if(enabled){enabled=false;audio.pause();stopEffects();await context.suspend();}else{await setup();await audio.play();enabled=true;nextBurst=context.currentTime+1.6;}state();}catch{enabled=false;audio.pause();stopEffects();state();button.querySelector('.sound-label').textContent='RETRY SOUND';}finally{busy=false;}});
document.addEventListener('visibilitychange',async()=>{if(!context)return;if(document.hidden){audio.pause();stopEffects();await context.suspend();}else if(enabled){try{await context.resume();await audio.play();nextBurst=context.currentTime+1.6;}catch{enabled=false;state();}}});
window.eventoriaAudio={interact:brush,sample(dt){
 pulse*=Math.pow(.05,Math.max(0,Math.min(dt,.1)));
 const inIntro=intro.getBoundingClientRect().bottom>0;
 if(enabled&&!audio.paused&&context?.state==='running'&&inIntro){
  const now=context.currentTime;
  if(!nextBurst)nextBurst=now+1.6;
  if(now>=nextBurst){
   const source=context.createBufferSource();source.buffer=boomBuffer;source.connect(effectGain);effects.add(source);source.onended=()=>{effects.delete(source);source.disconnect();};source.start(now);
   pulse=1;nextBurst=now+2;button.dataset.burstCount=String(++burstCount);
  }
 }else{nextBurst=0;}
 return {level:0,bass:0,beat:pulse};
}};
state();
})();
