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
