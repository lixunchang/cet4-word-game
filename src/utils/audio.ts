// 定义类型
interface LetterAudio {
  text: string;
  type: 'speech';
  utterance: SpeechSynthesisUtterance;
}

interface OnlineAudio extends LetterAudio {}

interface CurrentOnlineAudio {
  utterance?: SpeechSynthesisUtterance;
  audio?: HTMLAudioElement;
  text?: string;
  name?: string;
  url?: string;
}

type ProgressCallback = (loaded: number, total: number) => void;

// 单例音频管理器工具类
class AudioManager {
  private static instance: AudioManager;
  
  private letterAudios: Map<string, LetterAudio> = new Map(); // 存储字母音频
  private onlineAudios: Map<string, OnlineAudio> = new Map(); // 存储在线音乐
  private playingLetters: Set<string> = new Set(); // 正在播放的字母
  private currentOnlineAudio: CurrentOnlineAudio | null = null; // 当前播放的在线音乐
  
  private letterVolume: number = 0.7;
  private onlineVolume: number = 0.7;
  private isLooping: boolean = false;
  
  private constructor() {
    if (AudioManager.instance) {
      return AudioManager.instance;
    }
    AudioManager.instance = this;
    
    return this;
  }
  
  // 获取单例实例
  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }
  
  // 预加载所有字母音频
  async preloadAllLetters(onProgress: ProgressCallback | null = null): Promise<boolean> {
    console.log('iiiiii');
    const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
    let loadedCount = 0;
    
    for (const letter of letters) {
      try {
        await this.preloadLetter(letter);
        loadedCount++;
        if (onProgress) {
          onProgress(loadedCount, letters.length);
        }
      } catch (error) {
        console.error(`预加载字母 ${letter} 失败:`, error);
      }
    }
    
    return true;
  }
  
  // 预加载单个字母音频
  preloadLetter(letter: string): Promise<LetterAudio> {
    return new Promise((resolve) => {
      if (this.letterAudios.has(letter)) {
        // console.log(`字母 ${letter} 音频已缓存`, this.letterAudios.get(letter));
        resolve(this.letterAudios.get(letter)!);
        return;
      }
      
      // 使用 SpeechSynthesisUtterance 预加载字母发音
      const utterance = new SpeechSynthesisUtterance(letter);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // 获取语音列表并设置语音
      const voices = speechSynthesis.getVoices();
      utterance.voice = voices.find(voice => voice.lang === 'en-US') || voices[0];
      
      // 由于 SpeechSynthesis 不支持预加载，我们创建一个标识对象
      const letterAudio: LetterAudio = {
        text: letter,
        type: 'speech',
        utterance: utterance
      };
      
      this.letterAudios.set(letter, letterAudio);
      // console.log(`字母 ${letter} 音频预加载完成`);
      resolve(letterAudio);
    });
  }
  
  // 播放字母音频（支持同时播放多个）
  playLetter(letter: string, volume: number | null = null, speed: number = 1.0): boolean {
    // 如果字母音频已加载，直接播放
    if (this.letterAudios.has(letter)) {
      const letterAudio = this.letterAudios.get(letter)!;
      if (letterAudio.type === 'speech') {
        // 使用 SpeechSynthesis 播放
        const utterance = new SpeechSynthesisUtterance(letter);
        utterance.lang = 'en-US';
        utterance.rate = speed;
        utterance.pitch = 1.0;
        utterance.volume = volume || this.letterVolume;
        
        // 获取语音列表并设置语音
        const voices = speechSynthesis.getVoices();
        utterance.voice = voices.find(voice => voice.lang === 'en-US') || voices[0];
        
        speechSynthesis.speak(utterance);
        this.playingLetters.add(letter);
        
        utterance.onend = () => {
          this.playingLetters.delete(letter);
        };
        
        return true;
      }
    }
    
    // 如果字母音频未加载，先加载再播放
    this.preloadLetter(letter)
      .then(letterAudio => {
        if (letterAudio.type === 'speech') {
          const utterance = new SpeechSynthesisUtterance(letter);
          utterance.lang = 'en-US';
          utterance.rate = speed;
          utterance.pitch = 1.0;
          utterance.volume = volume || this.letterVolume;
          
          // 获取语音列表并设置语音
          const voices = speechSynthesis.getVoices();
          utterance.voice = voices.find(voice => voice.lang === 'en-US') || voices[0];
          
          speechSynthesis.speak(utterance);
          this.playingLetters.add(letter);
          
          utterance.onend = () => {
            this.playingLetters.delete(letter);
          };
        }
      })
      .catch(error => {
        console.error(`播放字母 ${letter} 失败:`, error);
      });
    
    return false;
  }
  
  // 播放错误音频
  playErrorSound(): void {
    try {
      const audio = new Audio(`${location.origin}${location.pathname}error-sound.mp3`);
      audio.volume = this.onlineVolume;
      audio.play().catch(e => {
        console.error('播放错误音频失败:', e);
      });
    } catch (error) {
      console.error('播放错误音频失败:', error);
    }
  }
  
  // 停止所有字母音频
  stopAllLetters(): void {
    this.playingLetters.clear();
    // 在实际应用中，这里需要停止所有正在播放的音频实例
  }
  
  // 根据单词生成在线音频URL
  private _getOnlineAudioUrl(word: string): string {
    return `https://dict.youdao.com/dictvoice?type=0&audio=${word}`;
  }
  
  // 预加载单个在线音乐（句子或单词）
  preloadOnlineAudio(text: string): Promise<OnlineAudio> {
    return new Promise((resolve) => {
      // 如果在线音乐已缓存，直接返回
      if (this.onlineAudios.has(text)) {
        resolve(this.onlineAudios.get(text)!);
        return;
      }
      
      // 使用 SpeechSynthesisUtterance 预加载文本发音
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // 获取语音列表并设置语音
      const voices = speechSynthesis.getVoices();
      utterance.voice = voices.find(voice => voice.lang === 'en-US') || voices[0];
      
      // 创建标识对象
      const onlineAudio: OnlineAudio = {
        text: text,
        type: 'speech',
        utterance: utterance
      };
      
      this.onlineAudios.set(text, onlineAudio);
      console.log(`在线音乐 ${text} 预加载完成`);
      resolve(onlineAudio);
    });
  }
  
  // 预加载所有在线音乐（句子或单词）
  async preloadAllOnlineAudios(texts: string[], onProgress: ProgressCallback | null = null): Promise<boolean> {
    let loadedCount = 0;
    
    for (const text of texts) {
      try {
        await this.preloadOnlineAudio(text);
        loadedCount++;
        if (onProgress) {
          onProgress(loadedCount, texts.length);
        }
      } catch (error) {
        console.error(`预加载在线音乐 ${text} 失败:`, error);
      }
    }
    
    return true;
  }
  
  // 播放在线音乐（句子或单词）
  playOnlineAudio(text: string, volume: number | null = null, rate: number = 1.0, pitch: number = 1.0): Promise<SpeechSynthesisUtterance> {
    // 停止当前播放的在线音乐
    this.stopOnlineAudio();
    
    volume = volume !== null ? volume : this.onlineVolume;
    
    // 如果在线音乐已缓存，直接播放
    if (this.onlineAudios.has(text)) {
      const onlineAudio = this.onlineAudios.get(text)!;
      if (onlineAudio.type === 'speech') {
        // 使用 SpeechSynthesis 播放
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;
        
        // 获取语音列表并设置语音
        const voices = speechSynthesis.getVoices();
        utterance.voice = voices.find(voice => voice.lang === 'en-US') || voices[0];
        
        // 设置当前播放的音频
        this.currentOnlineAudio = {
          utterance: utterance,
          text: text
        };
        
        speechSynthesis.speak(utterance);
        return Promise.resolve(utterance);
      }
    }
    
    // 如果在线音乐未加载，先加载再播放
    return this.preloadOnlineAudio(text).then(onlineAudio => {
      if (onlineAudio.type === 'speech') {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;
        
        // 获取语音列表并设置语音
        const voices = speechSynthesis.getVoices();
        utterance.voice = voices.find(voice => voice.lang === 'en-US') || voices[0];
        
        // 设置当前播放的音频
        this.currentOnlineAudio = {
          utterance: utterance,
          text: text
        };
        
        speechSynthesis.speak(utterance);
        return utterance;
      }
      throw new Error('Failed to play online audio');
    });
  }
  
  // 播放在线音频对象
  private _playOnlineAudio(audio: HTMLAudioElement, name: string, volume: number, loop: boolean): void {
    // 检查是否是 SpeechSynthesis 类型
    // 注意：这个方法在当前实现中不会被调用，因为没有使用传统的 Audio 对象
    // 保留此方法以保持代码完整性
    
    // 处理传统的 Audio 对象
    this.currentOnlineAudio = {
      audio: audio,
      name: name,
      url: audio.src
    };
    
    audio.volume = volume;
    audio.loop = loop;
    audio.play().catch(e => {
      console.error('播放在线音乐失败:', e);
    });
  }
  
  // 暂停在线音乐
  pauseOnlineAudio(): void {
    if (this.currentOnlineAudio) {
      // 检查是否是 SpeechSynthesisUtterance 对象
      if (this.currentOnlineAudio.utterance) {
        // SpeechSynthesis 没有暂停功能，我们只能取消语音
        speechSynthesis.cancel();
      } else if (this.currentOnlineAudio.audio) {
        // 传统 Audio 对象
        this.currentOnlineAudio.audio.pause();
      }
    }
  }
  
  // 恢复在线音乐
  resumeOnlineAudio(): void {
    if (this.currentOnlineAudio) {
      // 检查是否是 SpeechSynthesisUtterance 对象
      if (this.currentOnlineAudio.utterance) {
        // SpeechSynthesis 没有恢复功能，我们重新播放
        speechSynthesis.speak(this.currentOnlineAudio.utterance);
      } else if (this.currentOnlineAudio.audio) {
        // 传统 Audio 对象
        this.currentOnlineAudio.audio.play().catch(e => {
          console.error('恢复在线音乐失败:', e);
        });
      }
    }
  }
  
  // 停止在线音乐
  stopOnlineAudio(): void {
    if (this.currentOnlineAudio) {
      // 检查是否是 SpeechSynthesisUtterance 对象
      if (this.currentOnlineAudio.utterance) {
        // 停止 SpeechSynthesis 语音
        speechSynthesis.cancel();
      } else if (this.currentOnlineAudio.audio) {
        // 传统 Audio 对象
        this.currentOnlineAudio.audio.pause();
        this.currentOnlineAudio.audio.currentTime = 0;
      }
      this.currentOnlineAudio = null;
    }
  }
  
  // 设置字母音量
  setLetterVolume(volume: number): void {
    this.letterVolume = volume;
    this.letterAudios.forEach(audio => {
      // 注意：SpeechSynthesisUtterance 的音量在播放时设置
    });
  }
  
  // 设置在线音乐音量
  setOnlineVolume(volume: number): void {
    this.onlineVolume = volume;
    if (this.currentOnlineAudio) {
      // 检查是否是 SpeechSynthesisUtterance 对象
      if (this.currentOnlineAudio.utterance) {
        this.currentOnlineAudio.utterance.volume = volume;
      } else if (this.currentOnlineAudio.audio) {
        // 传统 Audio 对象
        this.currentOnlineAudio.audio.volume = volume;
      }
    }
  }
  
  // 设置循环
  setLoop(loop: boolean): void {
    this.isLooping = loop;
    if (this.currentOnlineAudio) {
      // SpeechSynthesisUtterance 不支持循环，只有传统 Audio 对象支持
      if (this.currentOnlineAudio.audio) {
        this.currentOnlineAudio.audio.loop = loop;
      }
    }
  }
  
  // 获取播放状态
  getPlaybackStatus(): {
    playingLetters: string[];
    currentOnlineAudio: CurrentOnlineAudio | null;
    lettersCached: boolean;
  } {
    return {
      playingLetters: Array.from(this.playingLetters),
      currentOnlineAudio: this.currentOnlineAudio,
      lettersCached: this.letterAudios.size === 26
    };
  }
  
  // 获取缓存状态
  getCacheStatus(): {
    lettersCached: boolean;
    onlineAudios: Record<string, OnlineAudio>;
  } {
    return {
      lettersCached: this.letterAudios.size === 26,
      onlineAudios: Object.fromEntries(this.onlineAudios) as Record<string, OnlineAudio>
    };
  }
}

export default AudioManager.getInstance();