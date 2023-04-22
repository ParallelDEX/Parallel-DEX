<template>
  <div v-html="svgCode"></div>
</template>

<script>
export default {
  name: 'SvgComponent',
  data() {
    return {
   svgCode: `<svg height="65" stroke-miterlimit="1" version="1.1" viewBox="0 0 288 300" width="65" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:vectornator="http://vectornator.io" xmlns:xlink="http://www.w3.org/1999/xlink" style="fill-rule: nonzero; clip-rule: evenodd; stroke-linecap: round; stroke-linejoin: round;"><defs></defs><g id="_x35_997047a-69c2-432d-836c-d299ff0ddb69" vectornator:layerName="_x35_997047a-69c2-432d-836c-d299ff0ddb69"><path d="M119.218 79.0275L119.218 220.973C119.218 229.415 132.372 229.415 132.372 220.973L132.372 79.0275C132.372 70.5854 119.218 70.5854 119.218 79.0275ZM167.613 79.0275L167.613 220.973C167.613 229.415 180.767 229.415 180.767 220.973L180.767 79.0275C180.767 70.5854 167.613 70.5854 167.613 79.0275Z" fill="#ffffff" fill-rule="nonzero" opacity="1" stroke="none"></path></g></svg>
`
    };
  }
};
</script>
