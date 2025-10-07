import type { SelectOption } from 'src/modules/lineup-builder/types';

export interface OrderBySelectOption extends SelectOption {
  field: string;
  direction: 'asc' | 'desc';
}

export type OrderBySelectOptionList = OrderBySelectOption[];

export const ORDER_BY_DEFAULT: OrderBySelectOption = {
  value: '',
  label: 'Seleccione un orden',
  field: '',
  direction: 'asc',
  description: '',
};

export const LIST_OPTIONS: OrderBySelectOptionList = [
  {
    value: 'name_asc',
    label: 'Nombre (A-Z)',
    field: 'name',
    direction: 'asc',
    description: 'Ordenar por nombre alfabéticamente',
  },
  {
    value: 'name_desc',
    label: 'Nombre (Z-A)',
    field: 'name',
    direction: 'desc',
    description: 'Ordenar por nombre alfabéticamente inverso',
  },
  {
    value: 'marketValue_desc',
    label: 'Salario (Mayor a menor)',
    field: 'marketValue',
    direction: 'desc',
    description: 'Ordenar por Salario de mayor a menor',
  },
  {
    value: 'marketValue_asc',
    label: 'Salario (Menor a mayor)',
    field: 'marketValue',
    direction: 'asc',
    description: 'Ordenar por Salario de menor a mayor',
  },
  {
    value: 'rating_desc',
    label: 'Rating (Mayor a menor)',
    field: 'rating',
    direction: 'desc',
    description: 'Ordenar por rating de mayor a menor',
  },
  {
    value: 'rating_asc',
    label: 'Rating (Menor a mayor)',
    field: 'rating',
    direction: 'asc',
    description: 'Ordenar por rating de menor a mayor',
  },
];
