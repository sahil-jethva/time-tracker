export interface Clients{
  c_name: string;
  id:number
}

export interface Login{
  token: string
  name: string
  email: string
  password: string
  id: number
}

export interface Projects{
  p_name: string
  id: number
}
export interface Tasks {
  t_name: string
  id: number
}
export interface UserLoginDetail {
  id: number
  email: string
  password: number
  name: string
}
export interface Logs{
  u_id: number
  date: string
  c_name: string
  p_name: string
  tasks: Task[]
}

export interface Task{
  t_name: string
  start_time: number  | null
  end_time: number   | null;
  description: string
  totalTime?: number | string | undefined
}
