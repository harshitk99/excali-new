import React from 'react';
import RoomContent from './RoomContent';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function Room({ params }: PageProps) {
  const { slug } = await params;

  return <RoomContent slug={slug} />;
}
