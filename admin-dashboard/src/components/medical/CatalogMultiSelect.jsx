import React from 'react';
import Select from 'react-select';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import useLanguage from '../../hooks/useLanguage';

export default function CatalogMultiSelect({ endpoint, value = [], onChange, isDisabled }) {
  const { isRTL } = useLanguage();

  const { data: options = [], isLoading } = useQuery({
    queryKey: [endpoint, 'catalog-options'],
    queryFn: () =>
      api.get(endpoint, { params: { limit: 500 } }).then((res) => {
        const list = res.data?.data || [];
        return list
          .filter((item) => item.isActive !== false)
          .map((item) => ({
            value: item.id,
            label: isRTL ? item.nameAr : item.nameEn,
          }));
      }),
  });

  const selected = options.filter((o) => value.includes(o.value));

  return (
    <Select
      isMulti
      isLoading={isLoading}
      isDisabled={isDisabled}
      options={options}
      value={selected}
      onChange={(opts) => onChange(opts?.map((o) => o.value) || [])}
      className="react-select-container"
      classNamePrefix="react-select"
      placeholder="..."
    />
  );
}
