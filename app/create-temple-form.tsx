'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createTempleAction } from '@/app/actions';
import { rootDomain } from '@/lib/utils';

type CreateState = {
  error?: string;
  success?: string;
  slug?: string;
};

export function CreateTempleForm() {
  const [state, formAction, isPending] = useActionState<CreateState, FormData>(
    createTempleAction,
    {}
  );

  return (
    <Card className="p-6 shadow-md border">
      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">寺廟名稱</Label>
          <Input
            id="name"
            name="name"
            placeholder="例：天壇宮"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">網址名稱</Label>
          <div className="flex items-center">
            <Input
              id="slug"
              name="slug"
              placeholder="tiantan"
              defaultValue={state?.slug}
              className="w-full rounded-r-none focus:z-10"
              required
            />
            <span className="bg-gray-100 px-3 border border-l-0 border-input rounded-r-md text-gray-500 min-h-[36px] flex items-center">
              .{rootDomain}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            僅可使用小寫英文字母、數字和連字符
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="intro">寺廟簡介（選填）</Label>
          <Textarea
            id="intro"
            name="intro"
            placeholder="簡短介紹您的寺廟，將顯示在公開頁面"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address">地址（選填）</Label>
            <Input id="address" name="address" placeholder="台北市中正區..." />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">電話（選填）</Label>
            <Input id="phone" name="phone" placeholder="02-1234-5678" />
          </div>
        </div>

        {state?.error && (
          <div className="text-sm text-red-500">{state.error}</div>
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? '建立中...' : '建立寺廟'}
        </Button>
      </form>
    </Card>
  );
}
