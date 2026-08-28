import React, { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { Button, Card, WrapperModal } from "src/components";
import { UserRecharge, UserWithdraw } from "@/services";
import { contactUser } from "src/utils/contactLink";
import { HandleOpenFinancial } from "../../hooks/useFinanceAdmin";
import { openMail, openWhatsapp } from "src/utils/contactLink";

import { ExperiencePurchase } from "src/services/financial/Experiences.service";
import {
  BanknoteArrowUp,
  Mail,
  PackageCheck,
  PhoneCall,
  X,
} from "lucide-react-native";
export const getStatusColor = (status: string) => {
  switch (status) {
    case "ENTREGADO":
      return "#4caf50";
    case "RESERVADO":
      return "#ff9800";
    case "PAGADO":
      return "#4caf20";
    default:
      return "#666";
  }
};
const handleCommunicate = (numbner: string) => {
  // TODO ABRIR WA.ME/${number}?text=Hola,&20te&20escribo&20por&20tu&20producto&20de&20Beland!
};
type ExperiencesProps = {
  data: any;
  handleOpen: ({ id, action, entity }: HandleOpenFinancial) => void;
};
type ModalProps = {
  item: ExperiencePurchase;
  why: "ENTREGAR" | "PAGAR";
};
const handlePayed = async (id: string) => {
  alert("METODO NO IMPLEMENTADO");
};
const handleDeliver = async (id: string) => {
  alert("METODO NO IMPLEMENTADO");
};
const ExperiencesTab: React.FC<ExperiencesProps> = ({ data, handleOpen }) => {
  const [openModal, setOpenModal] = useState<ModalProps | null>(null);
  const handleOpenModal = (
    item: ExperiencePurchase,
    why: "ENTREGAR" | "PAGAR",
  ) => {
    setOpenModal({ item, why });
  };
  const ExperienceItem = ({ item }: { item: ExperiencePurchase }) => (
    <Card
      key={item.id}
      children={
        <View className="px-2">
          <View className="grid md:grid-cols-2 items-center mb-2">
            <Text className="text-lg font-semibold">{item.payment_method}</Text>
            <View className="flex flex-col items-start">
              <View className="flex flex-row gap-1">
                <Text>Status:</Text>
                <Text
                  style={{
                    color: getStatusColor(item.status),
                    fontWeight: 500,
                  }}
                >
                  {item.status}
                </Text>
              </View>

              <Text>
                Ultima actualización: {new Date(item.updated_at).toUTCString()}
              </Text>
            </View>
          </View>
          <View className="grid md:grid-cols-2 grid-cols-1 border-t border-t-slate-400 pt-2">
            <Text>Fecha de solicitud: {item.created_at}</Text>
            <Text>Email: {item.email}</Text>
            <Text>Monto total: USD$ {item.total_amount}</Text>
            <Text>Telefono {item.phone}</Text>
          </View>
          <View className="flex flex-col border-t border-t-slate-400 pt-2">
            <Text className="font-semibold text-lg">Productos</Text>
            <View className="grid md:grid-cols-2 grid-cols-1">
              {item.items.map((item) => {
                return (
                  <View key={item.id} className="flex flex-row gap-2">
                    <Text className="italic">{item.product.name}</Text>
                    <Text>${item.product.price} c/u</Text>
                    <Text>Cantidad: {item.quantity}</Text>
                  </View>
                );
              })}
            </View>
          </View>
          <View className="flex flex-row justify-center gap-8">
            <View className="flex flex-row justify-center gap-8 mt-2 pt-2 border-t border-t-slate-400 w-full">
              <Button
                variant="secondary"
                icon={<PhoneCall color="white" />}
                accessibilityRole="link"
                title="Comunicarse"
                onPress={() => openWhatsapp(item.phone)}
              />
              <Button
                variant="ghost"
                icon={<Mail color="orange" />}
                accessibilityRole="link"
                title="Mail"
                onPress={() => openMail(item.email)}
              />
              {item.status !== "PAGADO" && item.status !== "ENTREGADO" && (
                <Button
                  variant="ghost"
                  icon={<BanknoteArrowUp color="orange" />}
                  accessibilityRole="link"
                  title="PAGAR"
                  onPress={() => handleOpenModal(item, "PAGAR")}
                />
              )}
              {item.status !== "ENTREGADO" && (
                <Button
                  variant="ghost"
                  icon={<PackageCheck color="orange" />}
                  accessibilityRole="link"
                  title="ENTREGAR"
                  onPress={() => handleOpenModal(item, "ENTREGAR")}
                />
              )}
            </View>
          </View>
        </View>
      }
    />
  );

  return (
    <View>
      <Text className="text-xl font-semibold">Experiencias Vendidas</Text>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={ExperienceItem}
        showsVerticalScrollIndicator={false}
        bounces={true}
        ListEmptyComponent={
          <View className="text-center">
            <Text className="font-semibold text-xl mx-auto">
              No hay Expriencias vendidas
            </Text>
          </View>
        }
      />
      <WrapperModal
        isOpen={openModal !== null}
        onClose={() => setOpenModal(null)}
        header={<Text className="font-semibold">Metodo: {openModal?.why}</Text>}
        content={
          <View className="flex justify-center items-center">
            <Text>
              Estas a punto de marcar como{" "}
              {openModal?.why === "ENTREGAR"
                ? `ENTREGADO ${openModal.item.items.length <= 1 ? `el producto ${openModal.item.items[0].product.name}` : `los productos: ${openModal.item.items.map((item) => item.product.name)}`}`
                : `PAGADO por el valor de $${openModal?.item.total_amount} usd`}
              , estas seguro?
            </Text>
          </View>
        }
        actions={
          <View className="flex flex-row gap-5 justify-center items-center">
            <Button
              variant="ghost"
              icon={<X color="orange" />}
              accessibilityRole="link"
              title="Cancelar"
              onPress={() => setOpenModal(null)}
            />
            <Button
              variant="ghost"
              icon={
                openModal?.why === "ENTREGAR" ? (
                  <PackageCheck color="orange" />
                ) : (
                  <BanknoteArrowUp color="orange" />
                )
              }
              title="Confirmar"
              onPress={() => {
                openModal?.why === "ENTREGAR"
                  ? handleDeliver(openModal.item.id)
                  : handlePayed(openModal?.item.id!);
              }}
            />
          </View>
        }
      />
    </View>
  );
};

export default ExperiencesTab;
