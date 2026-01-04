// app/components/FilterForm.tsx
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { prisma } from '@/lib/prisma';

export default async function FilterForm({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const platforms = await prisma.platform.findMany();

  return (
    <form method="GET" className="flex items-center gap-2">
      <select
        name="platform"
        className="border border-gray-300 rounded-md px-3 py-2 text-sm"
        defaultValue={searchParams.platform || ''}
      >
        <option value="">Semua Platform</option>
        {platforms.map((platform) => (
          <option key={platform.id} value={platform.id}>
            {platform.name}
          </option>
        ))}
      </select>
      <Button type="submit" variant="outline" size="sm">
        <Filter className="w-4 h-4 mr-2" />
        Filter
      </Button>
    </form>
  );
}