const pool = require('../config/db');
const bcrypt = require('bcrypt')
const path = require('path')
// login 
exports.getLoginPage = (req, res) => {
  try {
    return res.render("login.handlebars", {
      title: 'Login',
      errorMessage: req.flash('error')
    });
  } catch (error) {
    console.log(error);
  }
}
// login post 
exports.loginPost = async (req, res) => {
  req.session.islogged = true;
  await req.session.save();
  const { username, password } = req.body;

  if (!username || !password) {
    req.flash('error', "Istiqomat inputlar to'ldirilishi shart");
    return res.redirect('/auth/login')
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE username = $1', [username.trim()]);

    if (userResult.rows.length === 0) {
      req.flash('error', "Username yoki parol xato");
      return res.redirect("/auth/login")
    }

    const user = userResult.rows[0];
    const validPassword = await bcrypt.compare(password.trim(), user.password);
    if (!validPassword) {
      req.flash('error', "Username yoki parol xato");
      return res.redirect('/auth/login')
    }

    return res.redirect('/sms/page');
  } catch (error) {
    console.error('Server xatosi:', error);
    req.flash('error', "Server xatosi yuz berdi");
    return res.redirect('/auth/login')
  }
}

// logout 
exports.logout = async (req, res) => {
  req.session.islogged = false
  await req.session.save()
  res.redirect('/auth/login')
}

// Update page
exports.updatePage = async (req, res) => {
  try {
    req.session.islogged = true;
    await req.session.save();

    const userResult = await pool.query('SELECT * FROM users');
    const user = userResult.rows[0];

    return res.render("update.handlebars", {
      title: 'Update',
      errorMessage: req.flash('error'),
      message: req.flash('success'),
      username: user.username, // Usernames emas, username bo'lishi mumkin
      islogged: req.session.islogged
    });
  } catch (error) {
    console.error('Server xatosi:', error);
    req.flash('error', 'Server xatosi yuz berdi');
    return res.redirect('/auth/login');
  }
};

// update post 
exports.updatePost = async (req, res) => {
  req.session.islogged = true
  await req.session.save()
  const { username, oldPassword, newPassword } = req.body
  if (!username || !oldPassword || !newPassword) {
    req.flash('error', "Sorovlar bosh qolishi mumkin emas")
    return res.redirect('/auth/update')
  }

  const userResult = await pool.query('SELECT * FROM users');

  const user = userResult.rows[0];
  const validPassword = await bcrypt.compare(oldPassword.trim(), user.password);

  if (!validPassword) {
    req.flash('error', "Parol xato");
    return res.redirect('/auth/update')
  }

  await pool.query(`UPDATE users SET username = $1, password = $2`, [username, await bcrypt.hash(newPassword, 10)])
  req.flash('success', "Muvaffiqiyatli yangilandi")
  return res.redirect("/auth/update")

}