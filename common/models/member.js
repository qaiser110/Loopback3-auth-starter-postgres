const { emailDs } = require('../../server/datasources.json')
const from = emailDs.transports[0].auth.user
const config = require('../../server/config.json')

module.exports = function(Member) {
  // send verification email after registration
  Member.afterRemote('create', function(context, user, next) {
    console.log('> user.afterRemote triggered')

    const options = {
      type: 'email',
      to: user.email,
      from,
      subject: 'Thanks for registering - Coin Alert App',
      // template: path.resolve(__dirname, '../../server/views/verify.ejs'),
      redirect: '/verified',
      user,
      text: `
Hi,

Thank you for joining Coin Alert App.

Please verify your email by clicking this link:

{href}

Thank you,
Coin Alert Team
      `,
    }

    user.verify(options, function(err, response) {
      if (err) {
        Member.deleteById(user.id)
        return next(err)
      }
      context.res.render('response', {
        title: 'Signed up successfully',
        content:
          'Please check your email and click on the verification link ' +
          'before logging in.',
        redirectTo: '/',
        redirectToLinkText: 'Log in',
      })
    })
  })

  // Method to render
  Member.afterRemote('prototype.verify', function(context, user, next) {
    context.res.render('response', {
      title:
        'A Link to reverify your identity has been sent ' +
        'to your email successfully',
      content:
        'Please check your email and click on the verification link ' +
        'before logging in',
      redirectTo: '/',
      redirectToLinkText: 'Log in',
    })
  })

  // send password reset link when requested
  Member.on('resetPasswordRequest', function(info) {
    const url = 'http://' + config.host + ':' + config.port + '/reset-password'
    const html =
      'Click <a href="' +
      url +
      '?access_token=' +
      info.accessToken.id +
      '">here</a> to reset your password'

    Member.app.models.Email.send(
      {
        to: info.email,
        from,
        subject: 'Password reset',
        html: html,
      },
      function(err) {
        if (err) return console.log('> error sending password reset email')
        console.log('> sending password reset email to:', info.email)
      }
    )
  })

  // render UI page after password change
  Member.afterRemote('changePassword', function(context, user, next) {
    context.res.render('response', {
      title: 'Password changed successfully',
      content: 'Please login again with new password',
      redirectTo: '/',
      redirectToLinkText: 'Log in',
    })
  })

  // render UI page after password reset
  Member.afterRemote('setPassword', function(context, user, next) {
    context.res.render('response', {
      title: 'Password reset success',
      content: 'Your password has been reset successfully',
      redirectTo: '/',
      redirectToLinkText: 'Log in',
    })
  })
}
