import { Icon } from '@iconify/react/dist/iconify.js';
import * as React from 'react';

export interface IBadgeMedalProps {
    value: number;
}

export default function BadgeMedal (props: IBadgeMedalProps) {
  return (
    <div className='col-centered'>
      <Icon icon="fluent-color:shield-32" className='text-8xl'/>
      <span className='absolute text-3xl font-bold'>{props.value}</span>
    </div>
  );
}
