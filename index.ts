const dispatch = (payload: any) => {
  window.postMessage({
      type: 'REDUX_DISPATCH',
      payload: payload
  }, '*');
}

export const setup = (apiKey: string) => {
  return new Promise<void>((resolve, reject) => {
    window.addEventListener("message", (event) => {
      if(event?.data?.payload?.nextState?.popup?.activeTab) {
        // Don't finish until the report is submitted and processed
        resolve()
      }
    })
    dispatch({
      type: 'SET_API_KEY',
      payload: apiKey,
    })
    dispatch({
      type: 'POPUP_CONNECT'
    })
  })
}

export const startRecording = () => {
  document.title = "Record This Window"
  dispatch({ type: 'CLICK_START_RECORDING_SCREEN' })
}

export const stopRecording = () => {
  return new Promise<void>((resolve, reject) => {
    window.addEventListener("message", (event) => {
      if(event?.data?.payload?.nextState?.recording?.stopped) {
        // Don't finish until the browser has stopped recording
        resolve()
      }
    })
    window.postMessage({
      type: 'REDUX_DISPATCH',
      payload: { type: 'CLICK_STOP_RECORDING' }
    }, '*');
  })
}

export const saveRecording = (title:string, options={}) => {
  return new Promise<void>((resolve, reject) => {
    window.addEventListener("message", (event) => {
      if(!event?.data?.payload?.nextState?.report?.started &&
         event?.data?.payload?.nextState?.reports?.processing?.length === 0
        ) {
        // Don't finish until the report is submitted and processed
        resolve()
      }
    })
    window.postMessage({
      type: 'REDUX_DISPATCH',
      payload: { 
        type: 'UPDATE_REPORT', 
        payload: {
          updates: {
            title,
            ...options
          }
        },
      }
    }, '*');
    window.postMessage({
      type: 'REDUX_DISPATCH',
      payload: { 
        type: 'CLICK_SUBMIT_REPORT', 
      }
    }, '*');

    window.postMessage({
      type: 'REDUX_DISPATCH',
      payload: { type: 'POPUP_DISCONNECT' }
    }, '*');
  })
}

export const cancelRecording = () => {
    dispatch({ type: 'CANCEL_REPORT' })
    dispatch({ type: 'POPUP_DISCONNECT' })
}

export default {
  setup,
  startRecording,
  stopRecording,
  saveRecording,
  cancelRecording
}
