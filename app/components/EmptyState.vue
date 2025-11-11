<template>
  <div class="empty-state">
    <p>{{ message }}</p>
    <slot>
      <NuxtLink v-if="linkTo" :to="linkTo" class="btn-link">
        {{ linkText }}
      </NuxtLink>
    </slot>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message: string;
  linkTo?: string;
  linkText?: string;
}

defineProps<Props>();
</script>

<style scoped>
.empty-state {
  background: white;
  border-radius: 10px;
  padding: 3rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.empty-state p {
  margin-bottom: 1rem;
  color: #666;
  font-size: 1.1rem;
}

.btn-link {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-decoration: none;
  border-radius: 5px;
  font-weight: bold;
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}
</style>

