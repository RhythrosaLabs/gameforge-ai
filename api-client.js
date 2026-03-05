/**
 * api-client.js
 * WebSim compatibility shim + real OpenAI API integration.
 * Provides window.websim with chat completions, image generation, and TTS
 * using the OpenAI API key stored in localStorage under 'openAIKey'.
 *
 * This file must be loaded BEFORE all ES-module scripts.
 */

(function () {
  // ─── helpers ──────────────────────────────────────────────────────────────

  function getKey() {
    return (
      localStorage.getItem('openAIKey') ||
      localStorage.getItem('openai_api_key') ||
      ''
    );
  }

  function noKey() {
    const msg =
      'No OpenAI API key found. Please add your key in Settings → API Configuration.';
    console.error(msg);
    throw new Error(msg);
  }

  function handleAPIError(data, context) {
    if (data.error) {
      const msg = `OpenAI API error (${context}): ${data.error.message}`;
      console.error(msg, data.error);
      throw new Error(msg);
    }
  }

  // ─── chat completions ─────────────────────────────────────────────────────

  async function chatCompletions(options) {
    const key = getKey();
    if (!key) noKey();

    const body = {
      model: options.model || 'gpt-4o',
      messages: options.messages,
    };

    // If JSON mode is requested, enable it
    if (options.json) {
      body.response_format = { type: 'json_object' };
    }

    if (options.max_tokens) {
      body.max_tokens = options.max_tokens;
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    handleAPIError(data, 'chat/completions');

    const content = data.choices?.[0]?.message?.content ?? '';
    return { content };
  }

  // ─── image generation ─────────────────────────────────────────────────────

  async function imageGen(options) {
    const key = getKey();
    if (!key) noKey();

    // DALL-E 3 only supports specific sizes: 1024x1024, 1792x1024, 1024x1792
    const ALLOWED = ['1024x1024', '1792x1024', '1024x1792'];
    let w = options.width || 1024;
    let h = options.height || 1024;
    let sizeStr = `${w}x${h}`;
    if (!ALLOWED.includes(sizeStr)) {
      // Pick closest valid size
      if (w > h) sizeStr = '1792x1024';
      else if (h > w) sizeStr = '1024x1792';
      else sizeStr = '1024x1024';
    }

    const body = {
      model: 'dall-e-3',
      prompt: options.prompt,
      n: 1,
      size: sizeStr,
      quality: 'standard',
      response_format: 'url',
    };

    const res = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    handleAPIError(data, 'images/generations');

    const url = data.data?.[0]?.url;
    if (!url) throw new Error('No image URL returned from DALL-E 3');
    return { url };
  }

  // ─── text-to-speech ───────────────────────────────────────────────────────
  // Music generation via TTS is a rough approximation; the AudioGenerator
  // already has a proper fallback (Web Audio API), so we throw here and let it
  // gracefully degrade.

  async function textToSpeech(options) {
    const key = getKey();
    if (!key) noKey();

    // OpenAI TTS accepts a text string and returns audio.
    // For music prompts, this won't sound musical, so callers should fall back.
    const voiceMap = {
      'en-male': 'onyx',
      'en-female': 'shimmer',
    };

    const body = {
      model: 'tts-1',
      input: options.text,
      voice: voiceMap[options.voice] || 'alloy',
      response_format: 'mp3',
    };

    const res = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(
        `OpenAI TTS error: ${err.error?.message || res.statusText}`
      );
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    return { url };
  }

  // ─── expose as window.websim ──────────────────────────────────────────────

  window.websim = {
    chat: {
      completions: {
        create: chatCompletions,
      },
    },
    imageGen,
    textToSpeech,
  };

  console.log(
    '[GameForge AI] api-client.js loaded – OpenAI backend ready. ' +
    (getKey() ? '✅ API key found.' : '⚠️  No API key set – go to Settings to add one.')
  );
})();
