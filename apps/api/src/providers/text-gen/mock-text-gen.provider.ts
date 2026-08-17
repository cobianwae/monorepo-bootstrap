import {
  type GenerateScriptRequest,
  type GenerateScriptResult,
  type GenerateStoryboardRequest,
  type GenerateStoryboardResult,
  type GenerateTopicsRequest,
  type GenerateTopicsResult,
  type TextGenProvider,
} from '@shared/types';
import { AudioStrategy, ProviderName, SceneMode, StyleType } from '@shared/types';

const TOPIC_CANDIDATES = [
  {
    title: 'Mengapa 4-3-3 Kembali Mendominasi Sepak Bola Modern',
    hook: 'Setengah klub top dunia kembali ke formasi klasik ini — apa yang berubah?',
    angle: 'Taktikal dengan data: pressing, fullback inverted, dan peran gelandang box-to-box.',
    outline: ['Data formasi musim ini', 'Evolusi 4-3-3 vs 3-5-2', 'Studi kasus 3 klub', 'Prediksi musim depan'],
  },
  {
    title: 'Sang Maestro Lini Tengah: 5 Gelandang Terbaik Musim Ini',
    hook: 'Mereka tidak mencetak banyak gol, tapi mengendalikan setiap pertandingan.',
    angle: 'Player spotlight: statistik progresif, xG creation, dan pengaruh taktis.',
    outline: ['Kriteria penilaian', 'Top 5 breakdown', 'Perbandingan statistik', 'Kesimpulan'],
  },
  {
    title: 'Transfer Panas: Analisis Deadline Day yang Mengubah Segalanya',
    hook: '24 jam terakhir bursa transfer menyajikan kejutan demi kejutan.',
    angle: 'Berita + analisis: nilai transfer, kebutuhan tim, dan ekspektasi musim depan.',
    outline: ['Rekap transfer utama', 'Analisis nilai pasar', 'Dampak ke taktik tim', 'Kesimpulan'],
  },
];

const SCRIPT_DRAFTS: Record<StyleType, string> = {
  [StyleType.INFOGRAPHIC]:
    'Sepak bola modern tidak lagi hanya soal bakat — tapi soal data. Musim ini, 4-3-3 digunakan oleh 12 dari 20 klub papan atas, naik 30 persen dibanding lima tahun lalu. Formasi ini memberi fleksibilitas: tiga gelandang menutup lini tengah, fullback naik jadi penyerang tambahan, dan pressing dimulai dari penyerang sayap. Ambil contoh klub A: dengan 4-3-3, mereka mencetak 2,1 gol per pertandingan dan menekan lawan 15 persen lebih tinggi. Klub B justru gagal beradaptasi dan turun tiga peringkat. Polanya jelas — bukan formasi yang menang, tapi pemahaman akan ritmenya. Musim depan, tren ini akan semakin tajam.',
  [StyleType.JOURNALISM]:
    'Di balik dominasi 4-3-3 musim ini, ada pergeseran taktis yang jarang disorot: peran gelandang bertahan kini seperti dirigen orkestra. Wawancara dengan tiga pelatih papan atas mengungkap satu hal yang sama — mereka mencari pemain yang bisa membaca tempo. Ketika lawan menekan, gelandang ini menarik garis pertahanan. Ketika bola bergulir cepat, mereka adalah titik awal serangan. Angka mendukung cerita ini: tim berbasis 4-3-3 memenangkan 58 persen duel lini tengah, tertinggi dalam satu dekade. Tapi ada harga yang harus dibayar — beban fisik yang luar biasa dan risiko cedera yang meningkat. Inilah wajah baru sepak bola modern.',
  [StyleType.ANIMATION]:
    'Bayangkan tiga gelandang berdiri seperti segitiga emas. Satu menekan, satu menutup ruang, satu siap mengalirkan bola. Itulah 4-3-3 — formasi yang berubah dari papan tulis menjadi seni. Musim ini formasi ini dipakai 12 klub papan atas. Persentase menang naik, pressing makin tinggi. Tapi ada rahasia kecil: formasi ini hanya hidup kalau pemainnya saling percaya. Satu umpan, satu gerakan, satu denyut. Dan ketika itu terjadi — stadion bergemuruh, jaring bergetar, dan sejarah ditulis dalam 90 menit.',
  [StyleType.CINEMATIC]:
    'Senja di kota besar. Lampu stadion menyala, dua tim bersiap. Di tengah lapangan, tiga gelandang berdiri dalam diam — mereka tahu pertandingan ini akan ditentukan oleh mereka. 4-3-3. Formasi yang musim ini mengubah peta kekuatan sepak bola Eropa. Ketika peluit pertama berbunyi, pressing dimulai, bola bergulir dari kaki ke kaki, dan ritme pertandingan terasa seperti musik. Dua belas klub, satu formasi, satu cerita yang sedang ditulis. Dan ketika laga usai, yang tersisa bukan hanya skor — tapi taktik yang jadi legenda.',
};

export class MockTextGenProvider implements TextGenProvider {
  readonly name = ProviderName.MOCK;
  readonly model = 'mock-text-1';

  async generateTopics(request: GenerateTopicsRequest): Promise<GenerateTopicsResult> {
    const count = request.count ?? 3;
    const candidates = TOPIC_CANDIDATES.slice(0, count).map((candidate) => ({
      title: candidate.title,
      hook: candidate.hook,
      angle: candidate.angle,
      outline: candidate.outline,
    }));
    return { candidates, provider: this.name, model: this.model };
  }

  async generateScript(request: GenerateScriptRequest): Promise<GenerateScriptResult> {
    const narration = SCRIPT_DRAFTS[request.context.styleGuide.styleType];
    return {
      hook: request.topic.hook,
      narration,
      structure: [
        { section: 'Hook', points: ['Pernyataan pembuka yang menahan perhatian'] },
        { section: 'Body', points: ['Fakta utama dan data pendukung', 'Contoh konkret atau studi kasus'] },
        { section: 'Penutup', points: ['Kesimpulan dan ajakan berlangganan'] },
      ],
      provider: this.name,
      model: this.model,
    };
  }

  async generateStoryboard(request: GenerateStoryboardRequest): Promise<GenerateStoryboardResult> {
    const styleType = request.context.styleGuide.styleType;
    const segments = this.splitNarration(request.script.narration, 6);

    const scenes = segments.map((segment, index) => {
      const isFirst = index === 0;
      const isLast = index === segments.length - 1;
      const silentStatScene = styleType === StyleType.INFOGRAPHIC && index % 3 === 2;

      return {
        narrationText: silentStatScene ? '' : segment,
        visualPrompt: this.buildVisualPrompt(styleType, request.context.styleGuide.name, index),
        onScreenText: silentStatScene ? 'Data menunjukkan tren naik 30%' : this.buildOnScreenText(segment, index),
        durationSec: request.sceneMode === SceneMode.LONG_TAKE ? 30 : isFirst || isLast ? 4 : 5,
        effectTag: this.buildEffectTag(index),
        audioStrategy: isFirst || isLast ? AudioStrategy.NATIVE_AS_SFX : silentStatScene ? AudioStrategy.SILENT : AudioStrategy.NATIVE_AS_SFX,
        sceneMode: request.sceneMode,
      };
    });

    return { scenes, provider: this.name, model: this.model };
  }

  private splitNarration(narration: string, maxSegments: number): string[] {
    const sentences = narration.split(/(?<=[.!?])\s+/).filter((sentence) => sentence.trim().length > 0);
    const parts: string[] = [];
    for (let i = 0; i < sentences.length && parts.length < maxSegments; i++) {
      parts.push(sentences[i] ?? '');
    }
    return parts;
  }

  private buildVisualPrompt(styleType: StyleType, channelName: string, index: number): string {
    const base =
      styleType === StyleType.INFOGRAPHIC
        ? 'Infographic motion graphic: clean stat cards, bold typography, football pitch diagram'
        : styleType === StyleType.JOURNALISM
          ? 'Journalistic broadcast scene: newsroom graphics, subtle motion, football stadium backdrop'
          : styleType === StyleType.ANIMATION
            ? 'Stylized 2D animation: expressive characters, bold shapes, dynamic camera'
            : 'Cinematic stadium scene: dramatic lighting, shallow depth of field, slow dolly';
    return `${base} — scene ${index + 1}, channel: ${channelName}`;
  }

  private buildOnScreenText(segment: string, index: number): string {
    if (index === 0) return segment.split(' ').slice(0, 4).join(' ');
    return segment.length > 60 ? `${segment.slice(0, 57)}...` : segment;
  }

  private buildEffectTag(index: number): string {
    const tags = ['zoom-in', 'slide-up', 'ken-burns', 'fade'];
    return tags[index % tags.length] ?? 'fade';
  }
}