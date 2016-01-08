class MailUtility

  filter: (messages, roles) ->
    filteredMessages = {}
    for key, value of messages
      messageActions = []
      for index of roles
        regExpFrom = new RegExp ''
        regExpTo = new RegExp ''
        if roles[index]['from']
          regExpFrom = new RegExp(roles[index]['from'].replace('*', '.*').replace('?', '.?'))
        if roles[index]['to']
          regExpTo = new RegExp(roles[index]['to'].replace('*', '.*').replace('?', '.?'))

        if regExpFrom.exec(value['from']) != null and regExpTo.exec(value['to']) != null
          messageActions.push(roles[index]['action'])
      if messageActions.length > 0
        filteredMessages[key] = messageActions
    filteredMessages

exports.filter = new MailUtility().filter
