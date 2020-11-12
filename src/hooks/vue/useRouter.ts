import router from '@/router';

export function initRoleRouter () {
    
}

// reset router
export function resetRouter() {
    const resetWhiteNameList = [
        'login',
        'root'
    ];
    router.getRoutes().forEach((route) => {
      const { name } = route;
      if (name && !resetWhiteNameList.includes(name as string)) {
        router.removeRoute(name);
      }
    });
}