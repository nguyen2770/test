import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Form, Input, Button, Alert, Row, Col, Card } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import '../../styles/auth.scss'
import profileImg from '../../assets/images/profile-img.png'
import logo from '../../assets/images/logo.svg'

function Register() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState()

  const handleValidSubmit = async (values) => {
    try {
      // const { email, password, username, fullname } = values;
      // const user = await signUp({
      //   variables: {
      //     email,
      //     password,
      //     username,
      //     fullname
      //   },
      // })

      setErrorMsg(null);
    } catch (error) {
      setErrorMsg(error)
    }
  }

  return (
    <div className="account-pages">
      <Row className="justify-center">
        <Col md={12} lg={8} xl={8}>
          <Card bodyStyle={{ padding: 0 }}>
            <div className="bg-soft-primary">
              <Row>
                <Col md={16}>
                  <div className="text-primary p-4">
                    <p>Get your PACS account now.</p>
                  </div>
                </Col>
                <Col md={8} className="align-self-end">
                  <img src={profileImg} alt="" className="w-100" />
                </Col>
              </Row>
            </div>
            <div className="p-4 pt-0">
              <div>
                <Link to="/">
                  <div className="avatar-md profile-user-wid mb-4">
                    <span className="avatar-title rounded-circle bg-light">
                      <img
                        src={logo}
                        alt=""
                        height="34"
                      />
                    </span>
                  </div>
                </Link>
              </div>
              <Form
                name="register"
                onFinish={handleValidSubmit}
                autoComplete="off"
              >
                {errorMsg === null && <Alert message="Register User Successfully" type="success" />}

                {errorMsg && <Alert message={errorMsg} type="error" />}

                <Form.Item
                  name="email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'The input is not valid email!' },
                  ]}
                >
                  <Input size='large' prefix={<MailOutlined />} type="email" placeholder="Email" />
                </Form.Item>

                <Form.Item
                  name="username"
                  rules={[
                    { required: true, message: 'Please input your username!' },
                  ]}
                >
                  <Input size='large' prefix={<UserOutlined />} placeholder="Username" />
                </Form.Item>

                <Form.Item
                  name="fullname"
                  rules={[
                    { required: true, message: 'Please input your fullname!' },
                  ]}
                >
                  <Input size='large' prefix={<UserOutlined />} placeholder="Fullname" />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Please input your password!' }]}
                  hasFeedback
                >
                  <Input.Password size='large' prefix={<LockOutlined />} placeholder="Password" />
                </Form.Item>
                
                <Form.Item
                  name="confirm"
                  dependencies={['password']}
                  hasFeedback
                  rules={[
                    {
                      required: true,
                      message: 'Please confirm your password!',
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('The two passwords that you entered do not match!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password size='large' prefix={<LockOutlined />} placeholder="Confirm password" />
                </Form.Item>

                <Form.Item className="mt-3">
                  <Button block size='large' type="primary" htmlType="submit" loading={loading}>
                    Register
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Card>
          <div className="mt-5 text-center">
            <p>
              Already have an account?{" "}
              <Link to="/login" className="font-weight-medium text-primary">
                {" "} Login
              </Link>{" "}
            </p>
            <p>
              © {new Date().getFullYear()} PNP. Crafted with{" "}
              <i className="mdi mdi-heart text-danger"></i> by PNP dev team
              </p>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default Register