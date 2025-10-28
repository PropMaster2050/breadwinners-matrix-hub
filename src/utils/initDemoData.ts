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

  // Initialize demo users if not exists or empty
  const existingUsersRaw = localStorage.getItem('breadwinners_users');
  let shouldSeed = false;
  if (!existingUsersRaw) {
    shouldSeed = true;
  } else {
    try {
      const parsed = JSON.parse(existingUsersRaw);
      if (Array.isArray(parsed) && parsed.length === 0) shouldSeed = true;
    } catch {
      shouldSeed = true;
    }
  }
  if (shouldSeed) {
    const demoUsers = [
      {
        id: 'demo-user-1',
        memberId: 'BW001',
        fullName: 'John Demo',
        username: 'johndemo',
        password: 'demo123',
        mobile: '1234567890',
        email: 'john@demo.com',
        level: 1,
        stage: 1,
        earnings: 500,
        directRecruits: 2,
        totalRecruits: 5,
        joinDate: new Date().toISOString(),
        transactionPin: '1234',
        wallets: {
          eWallet: 100,
          registrationWallet: 200,
          incentiveWallet: 200
        }
      },
      {
        id: 'demo-user-2',
        memberId: 'BW002',
        fullName: 'Jane Smith',
        username: 'janesmith',
        password: 'demo123',
        mobile: '0987654321',
        email: 'jane@demo.com',
        level: 1,
        stage: 1,
        earnings: 250,
        directRecruits: 1,
        totalRecruits: 3,
        joinDate: new Date().toISOString(),
        transactionPin: '5678',
        wallets: {
          eWallet: 50,
          registrationWallet: 100,
          incentiveWallet: 100
        }
      }
    ];
    localStorage.setItem('breadwinners_users', JSON.stringify(demoUsers));
  }
};