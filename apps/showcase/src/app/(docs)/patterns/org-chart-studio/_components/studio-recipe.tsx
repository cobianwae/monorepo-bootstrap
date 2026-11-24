import { CodeBlock } from '@ds/ui';
import { SectionHeading } from '../../../../../components/section-heading';
import { STUDIO_RECIPE } from './studio-demo-data';

export function StudioRecipe() {
  return (
    <section id="recipe" aria-labelledby="org-studio-recipe" className="space-y-4 scroll-mt-20">
      <SectionHeading
        id="org-studio-recipe"
        title="Integration recipe"
        description="The component never fetches or saves. Your page holds data and persists once per change."
      />
      <CodeBlock filename="org-page.tsx" language="tsx" code={STUDIO_RECIPE} />
    </section>
  );
}
