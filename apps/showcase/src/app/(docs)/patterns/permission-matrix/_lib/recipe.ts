/** Resep controlled (15 baris) untuk disalin konsumen; dijaga sama dengan pemakaian di page.tsx. */
export const PERMISSION_MATRIX_RECIPE = `// Controlled: onValueChange(next, diff) sekali per aksi; baseline dirty = saved.
const [value, setValue] = React.useState(initial);
const [saved, setSaved] = React.useState(initial);

<PermissionMatrix
  roles={roles}
  resources={resources}
  value={value}
  initialValue={saved}
  onValueChange={(next) => setValue(next)}
  onSave={() => setSaved(value)}
  onCancel={() => setValue(saved)}
  locked={(role, resource) =>
    role === 'viewer' && resource === 'hapus' ? 'Dikunci kebijakan' : null}
/>`;
