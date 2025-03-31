<script lang="ts">
  import { toasts } from '$lib/stores/toasts.store';
</script>

<div class="toasts-container">
  {#each $toasts as toast (toast.id)}
    <div class="toast toast-{toast.level}">
      <p>{toast.text}</p>
    </div>
  {/each}
</div>

<style>
  .toasts-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .toast {
    padding: 0.75rem 1rem;
    border-radius: 0.25rem;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    min-width: 200px;
    max-width: 400px;
    animation: slide-in 0.3s ease-out;
  }
  
  .toast p {
    margin: 0;
  }
  
  .toast-success {
    background-color: #48bb78;
    color: white;
  }
  
  .toast-error {
    background-color: #f56565;
    color: white;
  }
  
  .toast-warn {
    background-color: #ed8936;
    color: white;
  }
  
  .toast-info {
    background-color: #4299e1;
    color: white;
  }
  
  @keyframes slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
</style> 