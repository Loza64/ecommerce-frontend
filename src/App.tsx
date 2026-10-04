import { Routes } from '@generouted/react-router/lazy'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import { RecoilRoot } from 'recoil'
import { queryClient } from './config/queryClient'
import { QueryClientProvider } from '@tanstack/react-query'

dayjs.locale('es')

function App() {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <ToastContainer />
        <Routes />
      </QueryClientProvider>
    </RecoilRoot>
  )
}

export default App
