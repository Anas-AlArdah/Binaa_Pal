const mysql = require('mysql2/promise');

async function insertUltraMassiveData() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'osama12345',
    database: 'BinaaPall2'
  });

  console.log('Connected to database. Starting ultra massive data insertion...');

  try {
    // Cleanup to start fresh with the ultra set
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    await connection.query("TRUNCATE TABLE Offers");
    await connection.query("TRUNCATE TABLE Requests");
    await connection.query("TRUNCATE TABLE Reviews");
    await connection.query("TRUNCATE TABLE Worker_Skills");
    await connection.query("TRUNCATE TABLE WorkerProfiles");
    await connection.query("TRUNCATE TABLE Skills");
    await connection.query("TRUNCATE TABLE Users");
    await connection.query("TRUNCATE TABLE Roles");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");

    // 1. Roles
    await connection.query("INSERT INTO Roles (type, createdAt, updatedAt) VALUES ('Admin', NOW(), NOW()), ('Worker', NOW(), NOW()), ('Client', NOW(), NOW())");
    const [roles] = await connection.query("SELECT id, type FROM Roles");
    const roleId = {};
    roles.forEach(r => roleId[r.type] = r.id);

    // 2. Skills
    const skillsList = ['كهرباء', 'سباكة', 'نجارة', 'دهان', 'بناء', 'تكييف وتبريد', 'حدادة', 'ألمنيوم', 'تبليط', 'قصارة', 'ديكور جبص', 'تنظيف مباني', 'نقل أثاث', 'تصميم داخلي', 'عزل أسطح', 'صيانة مسابح'];
    for (const skill of skillsList) {
      await connection.query("INSERT INTO Skills (skill_name, createdAt, updatedAt) VALUES (?, NOW(), NOW())", [skill]);
    }
    const [skills] = await connection.query("SELECT id, skill_name FROM Skills");
    const skillId = {};
    skills.forEach(s => skillId[s.skill_name] = s.id);

    // 3. Names for generation
    const firstNames = ['محمد', 'أحمد', 'علي', 'يوسف', 'إبراهيم', 'خليل', 'محمود', 'سعيد', 'ياسين', 'عمر', 'خالد', 'حمزة', 'بلال', 'طارق', 'سامر', 'رامي', 'باسم', 'هاني', 'صالح', 'نضال', 'وليد', 'ياسر', 'سارة', 'ليلى', 'مريم', 'فاطمة', 'زينب', 'هند', 'نور', 'منى', 'ريم', 'أمل', 'جنى', 'حلا', 'دانية', 'سما', 'يارا', 'لجين', 'رغد', 'تالا'];
    const lastNames = ['حرز الله', 'النجار', 'المصري', 'عوض', 'أبو سنينة', 'القواسمي', 'التميمي', 'الجعبري', 'إدريس', 'منصور', 'صالح', 'عيسى', 'ياسين', 'كريم', 'حسن', 'زكي', 'محمود', 'حداد', 'نايف', 'حسين'];
    const cities = ['القدس', 'رام الله', 'نابلس', 'الخليل', 'جنين', 'طولكرم', 'قلقيلية', 'بيت لحم', 'أريحا', 'سلفيت', 'طوباس', 'غزة', 'خانيونس', 'رفح'];

    // 4. Generate Admins (10)
    for (let i = 1; i <= 10; i++) {
      await connection.query(`INSERT INTO Users (firstname, lastname, email, password, phone, location, role_id, createdAt, updatedAt) VALUES (?, ?, ?, 'admin123', ?, ?, ?, NOW(), NOW())`,
        ['مدير', `نظام_${i}`, `admin${i}@binaapal.ps`, `02${i}00000`, cities[i % cities.length], roleId['Admin']]);
    }

    // 5. Generate Workers (70)
    for (let i = 1; i <= 70; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = `worker${i}@binaa.com`;
      await connection.query(`INSERT INTO Users (firstname, lastname, email, password, phone, location, role_id, createdAt, updatedAt) VALUES (?, ?, ?, 'password123', ?, ?, ?, NOW(), NOW())`,
        [fn, ln, email, `059${1000000 + i}`, cities[Math.floor(Math.random() * cities.length)], roleId['Worker']]);
    }

    // 6. Generate Clients (70)
    for (let i = 1; i <= 70; i++) {
      const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
      const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
      const email = `client${i}@test.com`;
      await connection.query(`INSERT INTO Users (firstname, lastname, email, password, phone, location, role_id, createdAt, updatedAt) VALUES (?, ?, ?, 'password123', ?, ?, ?, NOW(), NOW())`,
        [fn, ln, email, `056${2000000 + i}`, cities[Math.floor(Math.random() * cities.length)], roleId['Client']]);
    }

    const [allUsers] = await connection.query("SELECT id, email, role_id FROM Users");
    const userId = {};
    const workers = [];
    const clients = [];
    allUsers.forEach(u => {
      userId[u.email] = u.id;
      if (u.role_id === roleId['Worker']) workers.push(u.id);
      if (u.role_id === roleId['Client']) clients.push(u.id);
    });

    // 7. Generate Worker Profiles & Skills
    const bios = [
      'فني متخصص في كافة أعمال الصيانة المنزلية والتشطيبات.',
      'خبرة طويلة ودقة في المواعيد مع ضمان جودة العمل.',
      'نسعى دائماً لإرضاء الزبائن وتقديم أفضل الحلول التقنية.',
      'متوفر للعمل في كافة مناطق الضفة والقدس.'
    ];

    for (const wid of workers) {
      const skillIdx = Math.floor(Math.random() * skillsList.length);
      const major = skillsList[skillIdx];
      await connection.query(`INSERT INTO WorkerProfiles (user_id, bio, major, min_price, max_price, p_images, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [wid, bios[Math.floor(Math.random() * bios.length)], major, 20 + Math.floor(Math.random() * 50), 100 + Math.floor(Math.random() * 200), `https://images.unsplash.com/photo-${1600000000000 + wid}?auto=format&fit=crop&w=800&q=80`]);
      
      const [p] = await connection.query("SELECT id FROM WorkerProfiles WHERE user_id = ?", [wid]);
      await connection.query("INSERT INTO Worker_Skills (worker_id, skill_id, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())", [p[0].id, skillId[major]]);
    }

    const [profiles] = await connection.query("SELECT id, user_id FROM WorkerProfiles");
    const profileIdByUserId = {};
    profiles.forEach(p => profileIdByUserId[p.user_id] = p.id);

    // 8. Generate Requests (100)
    const requestDescs = [
      'أريد تصليح عطل كهربائي مفاجئ في المنزل.', 'بحاجة لسباك لتصليح تسريب تحت المغسلة.', 'مطلوب نجار لتفكيك وتركيب خزانة ملابس.',
      'دهان غرفة نوم أطفال بألوان حديثة.', 'بناء جدار استنادي في الحديقة.', 'صيانة مكيف مركزي مع شحن غاز.',
      'تصميم ديكور داخلي لصالون البيت.', 'تنظيف شقة بعد التشطيب.', 'نقل أثاث بيت كامل من مدينة لأخرى.'
    ];

    for (let i = 0; i < 100; i++) {
      const cid = clients[Math.floor(Math.random() * clients.length)];
      await connection.query(`INSERT INTO Requests (user_id, description, city, status, date, createdAt, updatedAt) VALUES (?, ?, ?, 'Open', NOW(), NOW(), NOW())`,
        [cid, requestDescs[Math.floor(Math.random() * requestDescs.length)], cities[Math.floor(Math.random() * cities.length)]]);
    }

    // 9. Generate Reviews (150)
    const reviewComments = ['شغل بجنن تسلم إيديك', 'رائع جداً ومحترم', 'تأخر قليلاً لكن الشغل ممتاز', 'سعر غالي بس جودة عالية', 'أنصح به بشدة'];
    for (let i = 0; i < 150; i++) {
      const wid = workers[Math.floor(Math.random() * workers.length)];
      const cid = clients[Math.floor(Math.random() * clients.length)];
      await connection.query(`INSERT INTO Reviews (worker_id, user_id, comment, rating, date, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW(), NOW())`,
        [profileIdByUserId[wid], cid, reviewComments[Math.floor(Math.random() * reviewComments.length)], 3 + Math.floor(Math.random() * 3)]);
    }

    console.log('Ultra massive data insertion completed successfully!');
  } catch (err) {
    console.error('Error during ultra massive insertion:', err);
  } finally {
    await connection.end();
  }
}

insertUltraMassiveData();
