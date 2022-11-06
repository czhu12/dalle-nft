import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Button, Container, Form, InputGroup } from 'react-bootstrap';
import { buildRoute } from '../src/app/auth/client/routes';


const Generate = ({generationId}) => {
  const [prompt, setPrompt] = useState("");
  const [generationPrompt, setGenerationPrompt] = useState(null);
  const fetchGenerationPrompt = async () => {
    const response = await axios.get(buildRoute(`/ai_generation/generations/${4}`))
    setGenerationPrompt(response.data);
  }
  useEffect(() => {
    fetchGenerationPrompt();
  }, [])

  const createGenerationPrompt = async () => {
    const response = await axios.post(
      buildRoute('/ai_generation/generations'),
      { prompt: prompt },
    );
    setGenerationPrompt(response.data);
  }

  const checkAgain = async () => {
    if (generationPrompt) {
      const response = await axios.put(buildRoute(`/ai_generation/generations/${generationPrompt.id}/reload`));
      setGenerationPrompt(response.data);
    }
  }

  useEffect(() => {
    setInterval(checkAgain, 10000);
  }, []);

  return (
    <Container>
      <div className="text-center">
        <div className="mt-5 mb-2 display-2">
          A new thing
        </div>

        <div className="mb-5 display-5">
          Generate art with DALLE-2 and then create a 1/1
        </div>
      </div>
      <InputGroup>
        <Form.Control
          placeholder="Ex: Keanu Reeves portrait photo of a asia old warrior chief, tribal panther make up, blue on red, side profile, looking away, serious eyes, 50mm"
          value={prompt}
          as="textarea"
          rows={3}
          onChange={(e) => {
            setPrompt(e.target.value);
          }}
        />
      </InputGroup>
      <Button block onClick={createGenerationPrompt} className="my-4" size="lg">Generate</Button>
      {generationPrompt?.generation_image && (
        <div>
          <div className="font-italic display-4">
            "{generationPrompt.prompt}"
          </div>
          <img src={generationPrompt?.generation_image.source_url} />
        </div>
      )}
    </Container>
  );
}

export default Generate;
