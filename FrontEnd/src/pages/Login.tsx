/* eslint-disable react-hooks/exhaustive-deps */
import { ChangeEvent, useEffect, useState, useContext } from 'react' // Adicionado useContext
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { Link as RouterLink } from 'react-router-dom'
import Cookies from 'js-cookie'

// CONTEXT
import { AppThemeContext } from '@/contexts/AppThemeContext' // Importação do seu contexto

// MUI
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'

// COMPONENTS
import {
  BannerImage,
  FormComponent,
  Logo,
  StyledH1,
  StyledP,
} from '@/components'

// HOOKS
import { useFormValidation, usePost } from '@/hooks'

// UTILS
import { jwtExpirationDateConverter, pxToRem } from '@/utils'

// REDUX
import { useSelector } from 'react-redux'
import { RootState } from '@/redux'

// TYPES
import { DecodedJWT, LoginData, LoginPostData, MessageProps } from '@/types'

function Login() {
  const themeContext = useContext(AppThemeContext) // Acessando o tema
  const [showPassword, setShowPassword] = useState(false)

  const inputs = [
    { type: 'email', placeholder: 'Email' },
    { type: 'password', placeholder: 'Senha' },
  ]

  const { data, loading, error, postData } = usePost<LoginData, LoginPostData>(
    'login'
  )
  const { formValues, formValid, handleChange } = useFormValidation(inputs)
  const { email, message } = useSelector(
    (state: RootState) => state.createProfile
  )
  const navigate = useNavigate()

  const handleMessage = (): MessageProps => {
    if (!error)
      return {
        msg: message ?? '',
        type: 'success',
      }
    switch (error) {
      case 401:
        return {
          msg: 'Email e/ou senha inválidos.',
          type: 'error',
        }
      default:
        return {
          msg: 'Não foi possível realizar a operação. Entre em contato com nosso suporte.',
          type: 'error',
        }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await postData({
      email: String(formValues[0]),
      password: String(formValues[1]),
    })
  }

  useEffect(() => {
    if (data?.jwt_token) {
      const decoded: DecodedJWT = jwtDecode(data?.jwt_token)
      Cookies.set('Authorization', data?.jwt_token, {
        expires: jwtExpirationDateConverter(decoded.exp),
        secure: true,
      })
    }

    if (Cookies.get('Authorization')) {
      navigate('/home')
    }
  }, [data, navigate])

  useEffect(() => {
    if (email) {
      handleChange(0, email)
    }
  }, [email])

  return (
    <>
      <Box>
        <Grid container>
          <Grid
            item
            xs={12}
            sm={6}
            sx={{ alignItems: 'center', display: 'flex', height: '100vh' }}
          >
            <Container maxWidth="sm">
              <Box sx={{ marginBottom: pxToRem(24) }}>
                <Logo height={41} width={100} />
              </Box>
              <Box sx={{ marginBottom: pxToRem(24) }}>
                <StyledH1>Bem-vindo</StyledH1>
                <StyledP>Digite sua senha e email para logar</StyledP>
              </Box>
              <FormComponent
                inputs={inputs.map((input, index) => ({
                  type: input.type === 'password' 
                    ? (showPassword ? 'text' : 'password') 
                    : input.type,
                  placeholder: input.placeholder,
                  value: formValues[index] || '',
                  onChange: (e: ChangeEvent<HTMLInputElement>) =>
                    handleChange(index, (e.target as HTMLInputElement).value),
                  InputProps: input.type === 'password' ? {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  } : undefined
                }))}
                buttons={[
                  {
                    className: 'primary',
                    disabled: !formValid || loading,
                    type: 'submit',
                    onClick: handleSubmit,
                    children: loading ? 'Aguarde...' : 'Login',
                  },
                ]}
                message={handleMessage()}
              />

              {/* Bloco de Cadastro com Cor Dinâmica */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginTop: pxToRem(16),
                gap: '5px',
                alignItems: 'baseline' 
              }}>
                <Button 
                  component={RouterLink} 
                  to="/cadastro"
                  sx={{ 
                    textTransform: 'none', 
                    fontWeight: 700,
                    padding: 0,
                    minWidth: 'auto',
                    color: themeContext?.appTheme === 'light' ? '#003e7c' : '#90caf9',
                    '&:hover': { 
                      background: 'transparent', 
                      textDecoration: 'underline', 
                    }
                  }}
                >
                  Cadastre-se aqui
                </Button>
              </Box>

            </Container>
          </Grid>
          <Grid item sm={6} sx={{ display: { xs: 'none', sm: 'block' } }}>
            <BannerImage />
          </Grid>
        </Grid>
      </Box>
    </>
  )
}

export default Login