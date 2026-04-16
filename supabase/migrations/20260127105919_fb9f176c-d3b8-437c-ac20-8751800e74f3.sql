CREATE TABLE public.flashcards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  difficulty TEXT DEFAULT 'medium',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own flashcards"
ON public.flashcards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcards"
ON public.flashcards FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcards"
ON public.flashcards FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcards"
ON public.flashcards FOR UPDATE
USING (auth.uid() = user_id);