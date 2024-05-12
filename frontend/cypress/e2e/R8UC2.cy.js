describe('Toggling a todo of a task', () => {
  // define variables that we need on multiple occasions
  let uid // user id
  let name // name of the user (firstName + ' ' + lastName)
  let email // email of the user

  let oldTestUserID
  let taskID // id of the task

  before(function () {
    // find potential old test user
    cy.request({
      method: 'GET',
      url: 'http://localhost:5000/users/all'
    }).then((response) => {
      cy.log('body length:', response.body.length)
      if (response.body.length > 0) {
        const oldTestUserEmail = 'mon.doe@gmail.com'
        const oldTestUser = response.body.find(user => user.email === oldTestUserEmail)
        cy.log(oldTestUserEmail)

        if (oldTestUser) {
          oldTestUserID = oldTestUser._id.$oid

          cy.log('old id', oldTestUserID)

          // clean up state by deleting the user from the database
          cy.request({
            method: 'DELETE',
            url: `http://localhost:5000/users/${oldTestUserID}`
          }).then((response) => {
            cy.log(response.body)
          })
        }
      }
    })

    // create a fabricated user from a fixture
    cy.fixture('user.json')
      .then((user) => {
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/users/create',
          form: true,
          body: user
        }).then((response) => {
          uid = response.body._id.$oid
          name = user.firstName + ' ' + user.lastName
          email = user.email
        })
      })

    // create a task from a fixture
    cy.fixture('task.json')
      .then((task) => {
        let data = {
          ...task,
          userid: uid
        }
        cy.request({
          method: 'POST',
          url: 'http://localhost:5000/tasks/create',
          form: true,
          body: data
        }).then((response) => {
          taskID = response.body
          console.log(taskID)
        })
      })
  })

  beforeEach(function () {
    // enter the main main page
    cy.visit('http://localhost:3000')

    // enter email into field
    cy.contains('div', 'Email Address')
      .find('input[type=text]')
      .type(email)

    // submit the form on this page
    cy.get('form')
      .submit()

    // find the todo and click it
    cy.get('div.container-element')
      .find('a')
      .click()
  })

  it('1.1: the active todo becomes inactive', () => {
    // Find the todo item containing the text "Watch video"
    cy.contains('.todo-item .editable', 'Watch video')
    // Find the sibling span with class "checker.unchecked" and click on it
      .siblings('.checker.unchecked')
      .click();

    // After clicking, assert that the clicked span now has class "checker.checked"
    cy.contains('.todo-item .editable', 'Watch video')
      .siblings('.checker.checked')
      .should('exist')
  })

  it('1.2 the inactive todo becomes active', () => {
    let todoDescription = 'Inactive todo' // todo description to be used on multiple occasions

    // find form to create new todo
    cy.get('.inline-form')
      .find('input[type=text]')
      .type(todoDescription)

    // submit form to create todo
    cy.get('.inline-form')
      .submit()
    
    // click todo to make it inactive
    cy.contains('.todo-item .editable', todoDescription)
      .siblings('.checker.unchecked')
      .click()

    cy.contains('.todo-item .editable', todoDescription)
    // Find the sibling span with class "checker.unchecked" and click on it
      .siblings('.checker.checked')
      .click();

    // After clicking, assert that the clicked span now has class "checker.checked"
    cy.contains('.todo-item .editable', todoDescription)
      .siblings('.checker.unchecked')
      .should('exist')
  })
})
