import Container from "react-bootstrap/Container";
import {Button, Form} from "react-bootstrap";
import React from "react";
import axios from "axios";
import {Token, Tools} from "../utils";
import {useNavigate} from "react-router-dom";

export default function Setup({onInit}) {
  const [password, setPassword] = React.useState();
  const [initializing, setInitializeing] = React.useState();
  const [enabled, setEnabled] = React.useState(false);
  const navigate = useNavigate();

  // Generate password if not initialized.
  React.useEffect(() => {
    setPassword(Math.random().toString(16).slice(-6));
  }, []);

  // User click login button.
  const handleLogin = (e) => {
    e.preventDefault();

    if (initializing) return;
    setInitializeing(true);

    axios.post('/terraform/v1/mgmt/init', {
      password,
    }).then(res => {
      const data = res.data.data;
      console.log(`Init: OK, token is ${Tools.mask(data)}`);
      Token.save(data);
      onInit && onInit();
      navigate('/routers-scenario');
    }).catch(e => {
      const err = e.response.data;
      alert(`${err.code}: ${err.data.message}`);
      console.error(e);
    });
  };

  React.useEffect(() => {
    axios.get('/terraform/v1/mgmt/check').then(res => {
      setEnabled(!res.data?.data?.upgrading);
      console.log(`Check ok, ${JSON.stringify(res.data)}`);
    }).catch(e => {
      const err = e.response.data;
      alert(`服务器错误，${err.code}: ${err.data.message}`);
      console.error(err);
    });
  }, []);

  return (
    <>
      <Container>
        <Form>
          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>请设置初始密码</Form.Label>
            <Form.Control type="text" placeholder="Password" defaultValue={password}
              onChange={(e) => setPassword(e.target.value)}/>
            <Form.Text className="text-muted">
              * 初始密码由程序随机生成，可以修改成更高强度的密码 <br/>
              * 若忘记密码，可登录机器执行 <code>cat ~lighthouse/credentials.txt</code>
            </Form.Text>
          </Form.Group>
          <Button variant="primary" type="submit" disabled={!enabled} className={initializing && "disabled"} onClick={(e) => handleLogin(e)}>
            设置管理员密码
          </Button>
        </Form>
      </Container>
    </>
  );
}

