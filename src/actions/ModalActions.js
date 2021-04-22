export const showModal = (id, parametrs = {}) => (
    {
      type: 'SHOW_ALERT',
      payload: {'id': id, "parametrs": parametrs}
    }
)

export const hideModal = (parametrs = {}) => (
    {
      type: 'HIDE_ALERT',
      payload: {'id': '', "parametrs": parametrs},
    }
)
