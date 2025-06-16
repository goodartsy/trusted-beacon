// src/components/ui/button.tsx
import React, { FC, ButtonHTMLAttributes } from 'react';

export const Button: FC<ButtonHTMLAttributes<HTMLButtonElement>> = props => (
  <button
    {...props}
    className="px-3 py-1 rounded-xl shadow hover:opacity-90 focus:outline-none"
  />
);
