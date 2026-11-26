/** Resep onComplete (15 baris) untuk disalin konsumen; dijaga sama dengan pemakaian di page.tsx. */
export const IMAGE_CROPPER_RECIPE = `// onComplete(result) fires once per Save; blob + dataURL ready for your upload.
const [result, setResult] = React.useState<CropResult | null>(null);

<ImageCropper
  aspect={1}
  cropShape="round"
  outputSize={{ width: 512, height: 512 }}
  maxBytes={10_000_000}
  onComplete={(next) => {
    setResult(next);
    upload(next.blob); // you: fetch/PUT yourself
  }}
  onError={(message) => setNotice(message)}
/>
{result && <p>{result.width}×{result.height} saved</p>}`;
