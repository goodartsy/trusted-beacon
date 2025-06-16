// src/components/ui/card.tsx
import React, { FC, PropsWithChildren } from 'react';

export const Card: FC<PropsWithChildren> = ({ children }) => (
  <div className="bg-white rounded-2xl shadow p-4">{children}</div>
);
export const CardHeader: FC<PropsWithChildren> = ({ children }) => (
  <div className="border-b mb-2">{children}</div>
);
export const CardTitle: FC<PropsWithChildren> = ({ children }) => (
  <h3 className="text-xl font-semibold">{children}</h3>
);
export const CardContent: FC<PropsWithChildren> = ({ children }) => (
  <div className="mt-2">{children}</div>
);
