<template>
  <div v-html="svg" />
</template>
<script lang="ts">
  import { defineComponent, computed, ref } from 'vue';
  import { propTypes } from '/@/utils/propTypes';
  export default defineComponent({
    name: 'Svg',
    props: {
      type: propTypes.string.def('logo'),
      width: propTypes.number.def(50),
      height: propTypes.number.def(50),
    },
    setup(props) {
      const svg = computed(() => {
        switch (props.type) {
          case 'logo':
            return ` <svg width="${props.width}px" height="${props.height}px" viewBox="0 0 22.1 24.8">
          <path id="justhexagon" fill="#231f20" d="M9.8,24.4l-8.6-4.9C0.5,19.1,0,18.2,0,17.3l0-9.9c0-0.9,0.5-1.7,1.3-2.2l8.6-4.9c0.8-0.4,1.7-0.4,2.5,0
            l8.6,4.9c0.8,0.4,1.3,1.3,1.3,2.2v9.9c0,0.9-0.5,1.7-1.3,2.2l-8.6,4.9C11.5,24.9,10.6,24.9,9.8,24.4z"/>
          <circle id="circle_9" fill="#423d3d" cx="11.06" cy="12.4" r="9"/>
          <circle id="circle_6" fill="#231f20" cx="11.06" cy="12.4" r="6"/>
          <polyline points="9.33 13.4 11.06 12.4 12.79 13.4" stroke="white" stroke-width="3"
            stroke-linecap="round" fill="none" stroke-linejoin="round"/>
          <polyline points="11.06 12.4 11.06 10.4" stroke="white" stroke-width="3"
            stroke-linecap="round" fill="none" stroke-linejoin="round"/>
          <circle id="circle_2" fill="#423d3d" cx="11.06" cy="12.4" r="2"/>
            </svg>`;
            case 'white':
              return `<svg width="22.1" height="24.8"><path fill="#fff" d="M9.8 24.4l-8.6-4.9C.5 19.1 0 18.2 0 17.3V7.4c0-.9.5-1.7 1.3-2.2L9.9.3c.8-.4 1.7-.4 2.5 0L21 5.2c.8.4 1.3 1.3 1.3 2.2v9.9c0 .9-.5 1.7-1.3 2.2l-8.6 4.9c-.9.5-1.8.5-2.6 0z"/><circle fill="#423d3d" cx="11.06" cy="12.4" r="9"/><circle fill="#231f20" cx="11.06" cy="12.4" r="6"/><path stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" stroke-linejoin="round" d="M9.33 13.4l1.73-1 1.73 1m-1.73-1v-2"/><circle fill="#423d3d" cx="11.06" cy="12.4" r="2"/></svg>
`

          case 'footer':
            return `<svg width="${props.width}px" height="${props.height}px" viewBox="0 0 22.1 24.8">
          <path id="justhexagon" fill="#fff" d="M9.8,24.4l-8.6-4.9C0.5,19.1,0,18.2,0,17.3l0-9.9c0-0.9,0.5-1.7,1.3-2.2l8.6-4.9c0.8-0.4,1.7-0.4,2.5,0
            l8.6,4.9c0.8,0.4,1.3,1.3,1.3,2.2v9.9c0,0.9-0.5,1.7-1.3,2.2l-8.6,4.9C11.5,24.9,10.6,24.9,9.8,24.4z"/>
          <circle id="circle_9" fill="#423d3d" cx="11.06" cy="12.4" r="9"/>
          <circle id="circle_6" fill="#423d3d" cx="11.06" cy="12.4" r="6"/>
          <polyline points="9.33 13.4 11.06 12.4 12.79 13.4" stroke="black" stroke-width="3"
            stroke-linecap="round" fill="none" stroke-linejoin="round"/>
          <polyline points="11.06 12.4 11.06 10.4" stroke="black" stroke-width="3"
            stroke-linecap="round" fill="none" stroke-linejoin="round"/>
          <circle id="circle_2" fill="#a95" cx="11.06" cy="12.4" r="2"/>
            </svg>`;
        }
      });

      return { svg };
    },
  });
</script>
