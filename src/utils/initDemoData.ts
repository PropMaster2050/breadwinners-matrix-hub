// Initialize demo data for testing
export const initDemoData = () => {
  // Initialize demo e-pins if not exists
  const storedEpins = localStorage.getItem('breadwinners_epins');
  if (!storedEpins) {
    const demoEpins = [
      {
        code: 'DEMO123456',
        value: 250,
        isUsed: false,
        usedBy: null,
        usedDate: null,
        createdDate: new Date().toISOString()
      },
      {
        code: 'TEST789012',
        value: 250,
        isUsed: false,
        usedBy: null,
        usedDate: null,
        createdDate: new Date().toISOString()
      },
      {
        code: 'SAMPLE345678',
        value: 250,
        isUsed: false,
        usedBy: null,
        usedDate: null,
        createdDate: new Date().toISOString()
      }
    ];
    localStorage.setItem('breadwinners_epins', JSON.stringify(demoEpins));
  }

  // Initialize users array if not exists
  if (!localStorage.getItem('breadwinners_users')) {
    localStorage.setItem('breadwinners_users', JSON.stringify([]));
  }
};