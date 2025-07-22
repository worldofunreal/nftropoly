import { defineNuxtPlugin, useHead } from '#imports'

export default defineNuxtPlugin(() => {
  useHead({
    script: [
      {
        src: 'https://www.googletagmanager.com/gtag/js?id=G-X6YSLSMC65',
        async: true
      },
      {
        id: 'gtag-init',
        innerHTML: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-X6YSLSMC65');
        `,
        type: 'text/javascript'
      }
    ]
  })
}) 