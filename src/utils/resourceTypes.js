// src/utils/resourceTypes.js
export const RESOURCE_TYPES = [
    { id: 'video', name: 'Video', icon: '🎬' },
    { id: 'blog', name: 'Blog Article', icon: '📝' },
    { id: 'quiz', name: 'Quiz', icon: '❓' }
  ];
  
  export const getResourceTypeIcon = (type) => {
    const resourceType = RESOURCE_TYPES.find(rt => rt.id === type);
    return resourceType ? resourceType.icon : '📄';
  };