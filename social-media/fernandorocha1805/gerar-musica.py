"""Gera as trilhas de fundo dos especiais de fim de ano, sintetizadas por código.

- Natal: "Noite Feliz" (Franz Gruber, 1818, domínio público), caixinha de música com cordas suaves.
- Ano Novo: "Auld Lang Syne" (melodia tradicional, domínio público), versão animada com bateria leve.

Uso: python3 gerar-musica.py   (requer numpy e ffmpeg)
Saída: public/musica/natal.mp3 e public/musica/ano-novo.mp3
"""
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 44100
rng = np.random.default_rng(7)


def hz(midi):
    return 440.0 * 2 ** ((midi - 69) / 12)


def env(n, ataque, decaimento):
    t = np.arange(n) / SR
    a = np.minimum(t / max(ataque, 1e-4), 1.0)
    return a * np.exp(-t * decaimento)


def sino(freq, dur, vol=0.3):
    """Timbre de caixinha de música/celesta: parciais com decaimento rápido."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    som = np.zeros(n)
    for mult, amp, dec in [(1, 1.0, 2.2), (2.0, 0.35, 3.5), (3.0, 0.15, 5.0), (4.2, 0.08, 7.0)]:
        som += amp * np.sin(2 * np.pi * freq * mult * t) * np.exp(-t * dec)
    return vol * som * np.minimum(t / 0.004, 1)


def pluck(freq, dur, vol=0.3):
    """Timbre brilhante e curto (melodia do Ano Novo)."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    som = sum((1 / k) * np.sin(2 * np.pi * freq * k * t) for k in range(1, 7))
    return vol * som * env(n, 0.005, 4.0)


def pad(freqs, dur, vol=0.08):
    """Cordas suaves: senos levemente desafinados, ataque e saída lentos."""
    n = int(dur * SR)
    t = np.arange(n) / SR
    som = np.zeros(n)
    for f in freqs:
        for det in (-0.6, 0.0, 0.6):
            som += np.sin(2 * np.pi * (f + det) * t)
    som /= len(freqs) * 3
    a = np.minimum(t / 0.6, 1) * np.minimum((dur - t) / 0.6, 1)
    return vol * som * np.clip(a, 0, 1) * (1 + 0.05 * np.sin(2 * np.pi * 4.5 * t))


def bumbo(vol=0.5):
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    f = 110 * np.exp(-t * 18) + 45
    return vol * np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)


def palma(vol=0.18):
    n = int(0.2 * SR)
    t = np.arange(n) / SR
    return vol * rng.uniform(-1, 1, n) * np.exp(-t * 25)


def chimbal(vol=0.05):
    n = int(0.06 * SR)
    t = np.arange(n) / SR
    ruido = rng.uniform(-1, 1, n)
    ruido = np.diff(ruido, prepend=0)  # agudo
    return vol * ruido * np.exp(-t * 60)


def colocar(trilha, som, inicio):
    i = int(inicio * SR)
    fim = min(len(trilha), i + len(som))
    if fim > i:
        trilha[i:fim] += som[: fim - i]


def reverb(x, tempo=1.6, mistura=0.25):
    n = int(tempo * SR)
    t = np.arange(n) / SR
    ir = rng.normal(0, 1, n) * np.exp(-t * 4.5)
    ir[0] = 0
    ir /= np.sqrt(np.sum(ir ** 2))
    tamanho = len(x) + n
    molhado = np.fft.irfft(np.fft.rfft(x, tamanho) * np.fft.rfft(ir, tamanho), tamanho)[: len(x)]
    return (1 - mistura) * x + mistura * molhado * 0.6


ACORDES = {
    'C': [48, 55, 60, 64], 'G': [43, 55, 59, 62], 'G7': [43, 53, 59, 62], 'F': [41, 57, 60, 65],
    'Bb': [46, 58, 62, 65], 'Dm': [50, 57, 62, 65],
}


def noite_feliz():
    colcheia = 60 / (52 * 3)  # 6/8, semínima pontuada = 52
    melodia = [
        (67, 3), (69, 1), (67, 2), (64, 6), (67, 3), (69, 1), (67, 2), (64, 6),
        (74, 4), (74, 2), (71, 6), (72, 4), (72, 2), (67, 6),
        (69, 4), (69, 2), (72, 3), (71, 1), (69, 2), (67, 3), (69, 1), (67, 2), (64, 6),
        (69, 4), (69, 2), (72, 3), (71, 1), (69, 2), (67, 3), (69, 1), (67, 2), (64, 6),
        (74, 4), (74, 2), (77, 3), (74, 1), (71, 2), (72, 6), (76, 6),
        (72, 3), (67, 1), (64, 2), (67, 3), (65, 1), (62, 2), (60, 12),
    ]
    compassos = ['C', 'C', 'C', 'C', 'G', 'G', 'C', 'C', 'F', 'F', 'C', 'C', 'F', 'F', 'C', 'C',
                 'G', 'G', 'C', 'C', 'C', 'G7', 'C', 'C']
    total = sum(d for _, d in melodia) * colcheia + 3
    trilha = np.zeros(int(total * SR))
    t = 0.0
    for nota, d in melodia:
        colocar(trilha, sino(hz(nota), d * colcheia + 1.5, 0.28), t)
        t += d * colcheia
    for i, nome in enumerate(compassos):
        colocar(trilha, pad([hz(m) for m in ACORDES[nome]], 6 * colcheia + 0.6, 0.09), i * 6 * colcheia)
        # arpejo leve na segunda metade do compasso
        for k, m in enumerate(ACORDES[nome][1:]):
            colocar(trilha, sino(hz(m + 12), 1.2, 0.05), (i * 6 + 3 + k) * colcheia)
    return reverb(trilha, 2.2, 0.35)


def auld_lang_syne():
    tempo = 60 / 104
    melodia = [
        (60, 1),
        (65, 1.5), (65, 0.5), (65, 1), (69, 1), (67, 1.5), (65, 0.5), (67, 1), (69, 1),
        (65, 1.5), (65, 0.5), (69, 1), (72, 1), (74, 3), (74, 1),
        (72, 1.5), (69, 0.5), (69, 1), (65, 1), (67, 1.5), (65, 0.5), (67, 1), (69, 1),
        (65, 1.5), (62, 0.5), (62, 1), (60, 1), (65, 3), (60, 1),
    ]
    compassos = ['F', 'C', 'F', 'Bb', 'F', 'C', 'Dm', 'F']
    voltas = 2
    duracao_volta = 32 * tempo
    total = 1 * tempo + voltas * duracao_volta + 3
    trilha = np.zeros(int(total * SR))
    for v in range(voltas):
        base = v * duracao_volta
        t = base
        for nota, d in melodia:
            colocar(trilha, pluck(hz(nota + 12), d * tempo + 0.4, 0.2), t)
            colocar(trilha, sino(hz(nota + 24), d * tempo + 0.6, 0.04), t)
            t += d * tempo
        for i, nome in enumerate(compassos):
            inicio = base + (1 + i * 4) * tempo
            acorde = ACORDES[nome]
            colocar(trilha, pad([hz(m + 12) for m in acorde[1:]], 4 * tempo + 0.3, 0.06), inicio)
            for b in range(4):
                tb = inicio + b * tempo
                colocar(trilha, pluck(hz(acorde[0]), tempo * 0.9, 0.16), tb)  # baixo
                if b in (0, 2):
                    colocar(trilha, bumbo(), tb)
                if b in (1, 3):
                    colocar(trilha, palma(), tb)
                for meio in (0, 0.5):
                    colocar(trilha, chimbal(), tb + meio * tempo)
                # brilho: arpejo em semicolcheias
                for k in range(4):
                    colocar(trilha, sino(hz(acorde[1 + (b + k) % 3] + 24), 0.4, 0.025), tb + k * tempo / 4)
    return reverb(trilha, 1.2, 0.2)


def salvar(sinal, destino):
    sinal = sinal / (np.max(np.abs(sinal)) + 1e-9) * 0.9
    destino = Path(destino)
    destino.parent.mkdir(parents=True, exist_ok=True)
    tmp = destino.with_suffix('.wav')
    with wave.open(str(tmp), 'wb') as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((sinal * 32767).astype('<i2').tobytes())
    subprocess.run(['ffmpeg', '-hide_banner', '-loglevel', 'error', '-y', '-i', str(tmp),
                    '-af', 'loudnorm=I=-18:TP=-2', '-ar', '48000', '-b:a', '192k', str(destino)], check=True)
    tmp.unlink()


if __name__ == '__main__':
    salvar(noite_feliz(), 'public/musica/natal.mp3')
    salvar(auld_lang_syne(), 'public/musica/ano-novo.mp3')
    print('ok')
