<script lang="ts">
  export let width: string = '100%';
  export let height: string = '100px';
  export let borderRadius: string = 'var(--radius-md)';
  export let animationDelay: number = 0;
</script>

<div 
  class="skeleton-loader"
  style="
    width: {width}; 
    height: {height}; 
    border-radius: {borderRadius};
    animation-delay: {animationDelay}ms;
  "
>
</div>

<style>
  .skeleton-loader {
    background: linear-gradient(
      90deg,
      var(--bg-tertiary) 0%,
      var(--bg-secondary) 50%,
      var(--bg-tertiary) 100%
    );
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s ease-in-out infinite;
    position: relative;
    overflow: hidden;
  }

  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* For dark mode contrast adjustment */
  :global(.dark) .skeleton-loader {
    opacity: 0.7;
  }
</style> 