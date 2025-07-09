-- Migration: Adiciona o valor 'staff' ao enum user_type
ALTER TYPE public.user_type ADD VALUE IF NOT EXISTS 'staff'; 